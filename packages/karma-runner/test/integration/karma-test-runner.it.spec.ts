import { promisify } from 'util';
import http from 'http';

import { DryRunStatus, TestStatus, CompleteDryRunResult, TestResult, FailedTestResult } from '@stryker-mutator/api/test-runner';
import { testInjector, assertions, factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import { FilePattern } from 'karma';

import { KarmaTestRunner } from '../../src/karma-test-runner';
import { StrykerReporter } from '../../src/karma-plugins/stryker-reporter';
import { KarmaRunnerOptionsWithStrykerOptions } from '../../src/karma-runner-options-with-stryker-options';

function setOptions({
  files = ['testResources/sampleProject/src-instrumented/Add.js', 'testResources/sampleProject/test-jasmine/AddSpec.js'],
  frameworks = ['jasmine'],
}: {
  files?: ReadonlyArray<FilePattern | string>;
  frameworks?: string[];
}): void {
  (testInjector.options as KarmaRunnerOptionsWithStrykerOptions).karma = {
    projectType: 'custom',
    config: {
      files,
      logLevel: 'off',
      reporters: [],
      frameworks,
    },
  };
}

function createSut() {
  return testInjector.injector.injectClass(KarmaTestRunner);
}

describe(`${KarmaTestRunner.name} integration`, () => {
  let sut: KarmaTestRunner;

  const expectToHaveSuccessfulTests = (result: CompleteDryRunResult, n: number) => {
    expect(result.tests.filter((t) => t.status === TestStatus.Success)).to.have.length(n);
  };
  const expectToHaveFailedTests = (result: CompleteDryRunResult, expectedFailureMessages: string[]) => {
    const actualFailedTests = result.tests.filter(isFailed);
    expect(actualFailedTests).to.have.length(expectedFailureMessages.length);
    actualFailedTests.forEach((failedTest) => {
      const actualFailedMessage = failedTest.failureMessage.split('\n')[0];
      expect(actualFailedMessage).to.be.oneOf(expectedFailureMessages);
    });
  };

  describe('when all tests succeed', () => {
    before(() => {
      setOptions({ files: ['testResources/sampleProject/src/Add.js', 'testResources/sampleProject/test-jasmine/AddSpec.js'] });
      sut = createSut();
      return sut.init();
    });
    after(async () => {
      await sut.dispose();
    });

    describe('dryRun()', () => {
      it('should report completed tests', async () => {
        const runResult = await sut.dryRun(factory.dryRunOptions());
        assertions.expectCompleted(runResult);
        expectToHaveSuccessfulTests(runResult, 5);
        expectToHaveFailedTests(runResult, []);
      });

      it('should be able to run twice in quick succession', async () => {
        const actualResult = await sut.dryRun(factory.dryRunOptions());
        assertions.expectCompleted(actualResult);
      });
    });

    describe('runMutant()', () => {
      it('should report the mutant as survived', async () => {
        const mutantResult = await sut.mutantRun(factory.mutantRunOptions());
        assertions.expectSurvived(mutantResult);
      });
    });
  });

  describe('when some tests fail', () => {
    before(() => {
      setOptions({
        files: [
          'testResources/sampleProject/src/Add.js',
          'testResources/sampleProject/test-jasmine/AddSpec.js',
          'testResources/sampleProject/test-jasmine/AddFailedSpec.js',
        ],
      });
      sut = createSut();
      return sut.init();
    });
    after(async () => {
      await sut.dispose();
    });
    describe('dryRun', () => {
      it('should report the first failed test (bail)', async () => {
        const runResult = await sut.dryRun(factory.dryRunOptions());
        assertions.expectCompleted(runResult);
        expectToHaveSuccessfulTests(runResult, 5);
        expectToHaveFailedTests(runResult, ['Error: Expected 7 to be 8.']);
        expect(runResult.status).to.be.eq(DryRunStatus.Complete);
      });
    });
    describe('runMutant()', () => {
      it('should report the mutant as killed', async () => {
        const mutantResult = await sut.mutantRun(factory.mutantRunOptions());
        assertions.expectKilled(mutantResult);
        expect(mutantResult.killedBy).eq('spec5');
        expect(mutantResult.failureMessage.split('\n')[0]).eq('Error: Expected 7 to be 8.');
      });
    });
  });

  describe('when an error occurs while running tests', () => {
    before(() => {
      setOptions({
        files: [
          'testResources/sampleProject/src/Add.js',
          'testResources/sampleProject/src/Error.js',
          'testResources/sampleProject/test-jasmine/AddSpec.js',
        ],
      });
      sut = createSut();
      return sut.init();
    });
    after(async () => {
      await sut.dispose();
    });
    describe('dryRun', () => {
      it('should report Error with the error message', async () => {
        const runResult = await sut.dryRun(factory.dryRunOptions());
        assertions.expectErrored(runResult);
        expect(runResult.errorMessage).include('ReferenceError: someGlobalVariableThatIsNotDeclared is not defined');
      });
    });

    describe('runMutant()', () => {
      it('should report Error with the error message', async () => {
        const runResult = await sut.mutantRun(factory.mutantRunOptions());
        assertions.expectErrored(runResult);
        expect(runResult.errorMessage).include('ReferenceError: someGlobalVariableThatIsNotDeclared is not defined');
      });
    });
  });

  describe('when an error occurs on startup', () => {
    it('should reject the init promise', async () => {
      setOptions({ frameworks: ['jasmine', 'not-exists'] });
      sut = createSut();
      await expect(sut.init()).rejected;
    });

    afterEach(async () => {
      await sut.dispose();
    });
  });

  describe('when no error occurred and no test is performed', () => {
    before(() => {
      setOptions({ files: ['testResources/sampleProject/src/Add.js', 'testResources/sampleProject/test-jasmine/EmptySpec.js'] });
      sut = createSut();
      return sut.init();
    });
    after(async () => {
      await sut.dispose();
    });
    it('should report Complete without errors', async () => {
      const runResult = await sut.dryRun(factory.dryRunOptions());
      assertions.expectCompleted(runResult);
      expectToHaveSuccessfulTests(runResult, 0);
      expectToHaveFailedTests(runResult, []);
    });
  });

  describe('when adding an error file with included: false', () => {
    before(() => {
      setOptions({
        files: [
          { pattern: 'testResources/sampleProject/src/Add.js', included: true },
          { pattern: 'testResources/sampleProject/test-jasmine/AddSpec.js', included: true },
          { pattern: 'testResources/sampleProject/src/Error.js', included: false },
        ],
      });
      sut = createSut();
      return sut.init();
    });
    after(async () => {
      await sut.dispose();
    });
    it('should report Complete without errors', async () => {
      const runResult = await sut.dryRun(factory.dryRunOptions());
      assertions.expectCompleted(runResult);
    });
  });

  describe('when specified port is not available', () => {
    let dummyServer: DummyServer;

    before(async () => {
      dummyServer = await DummyServer.create();
      setOptions({});
      sut = createSut();
      return sut.init();
    });

    after(async () => {
      if (dummyServer) {
        await dummyServer.dispose();
      }
      await sut.dispose();
    });

    it('should choose different port automatically and report Complete without errors', async () => {
      const actualResult = await sut.dryRun(factory.dryRunOptions());
      expect(StrykerReporter.instance.karmaConfig!.port).not.eq(dummyServer.port);
      assertions.expectCompleted(actualResult);
    });
  });
});

class DummyServer {
  private readonly httpServer: http.Server;

  private constructor() {
    this.httpServer = http.createServer();
  }

  public get port() {
    const address = this.httpServer.address();
    if (!address || typeof address === 'string') {
      throw new Error(`Address "${address}" was unexpected: https://nodejs.org/dist/latest-v11.x/docs/api/net.html#net_server_address`);
    } else {
      return address.port;
    }
  }

  public static async create(): Promise<DummyServer> {
    const server = new DummyServer();
    await server.init();
    return server;
  }

  private async init(): Promise<void> {
    const listen: (port: number, host: string) => Promise<void> = promisify(this.httpServer.listen.bind(this.httpServer));
    await listen(0, '0.0.0.0');
  }

  public dispose(): Promise<void> {
    return promisify(this.httpServer.close.bind(this.httpServer))();
  }
}
function isFailed(t: TestResult): t is FailedTestResult {
  return t.status === TestStatus.Failed;
}
