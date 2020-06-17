import { promisify } from 'util';
import * as http from 'http';

import { RunStatus, TestStatus, CompleteDryRunResult, TestResult, FailedTestResult } from '@stryker-mutator/api/test_runner2';
import { testInjector, assertions, factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import { FilePattern } from 'karma';

import KarmaTestRunner from '../../src/KarmaTestRunner';

function setOptions(
  files: ReadonlyArray<FilePattern | string> = [
    'testResources/sampleProject/src-instrumented/Add.js',
    'testResources/sampleProject/test-jasmine/AddSpec.js',
  ],
  coverageAnalysis: 'all' | 'perTest' | 'off' = 'off'
): void {
  testInjector.options.coverageAnalysis = coverageAnalysis;
  testInjector.options.karma = {
    config: {
      files,
      logLevel: 'off',
      reporters: [],
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
      setOptions(['testResources/sampleProject/src/Add.js', 'testResources/sampleProject/test-jasmine/AddSpec.js']);
      sut = createSut();
      return sut.init();
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
      setOptions([
        'testResources/sampleProject/src/Add.js',
        'testResources/sampleProject/test-jasmine/AddSpec.js',
        'testResources/sampleProject/test-jasmine/AddFailedSpec.js',
      ]);
      sut = createSut();
      return sut.init();
    });
    describe('dryRun', () => {
      it('should report failed tests', async () => {
        const runResult = await sut.dryRun(factory.dryRunOptions());
        assertions.expectCompleted(runResult);
        expectToHaveSuccessfulTests(runResult, 5);
        expectToHaveFailedTests(runResult, ['Error: Expected 7 to be 8.', 'Error: Expected 3 to be 4.']);
        expect(runResult.status).to.be.eq(RunStatus.Complete);
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
      setOptions([
        'testResources/sampleProject/src/Add.js',
        'testResources/sampleProject/src/Error.js',
        'testResources/sampleProject/test-jasmine/AddSpec.js',
      ]);
      sut = createSut();
      return sut.init();
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

  describe('when no error occurred and no test is performed', () => {
    before(() => {
      setOptions(['testResources/sampleProject/src/Add.js', 'testResources/sampleProject/test-jasmine/EmptySpec.js']);
      sut = createSut();
      return sut.init();
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
      setOptions([
        { pattern: 'testResources/sampleProject/src/Add.js', included: true },
        { pattern: 'testResources/sampleProject/test-jasmine/AddSpec.js', included: true },
        { pattern: 'testResources/sampleProject/src/Error.js', included: false },
      ]);
      sut = createSut();
      return sut.init();
    });

    it('should report Complete without errors', async () => {
      const runResult = await sut.dryRun(factory.dryRunOptions());
      assertions.expectCompleted(runResult);
    });
  });

  describe('when coverage data is available', () => {
    before(() => {
      setOptions(['testResources/sampleProject/src-instrumented/Add.js', 'testResources/sampleProject/test-jasmine/AddSpec.js'], 'all');
      sut = createSut();
      return sut.init();
    });

    it('should report coverage data', async () => {
      const runResult = await sut.dryRun(factory.dryRunOptions());
      assertions.expectCompleted(runResult);
      expect(runResult.mutantCoverage).to.be.ok;
    });
  });

  describe('when specified port is not available', () => {
    let dummyServer: DummyServer;

    before(async () => {
      dummyServer = await DummyServer.create();
      setOptions();
      sut = createSut();
      return sut.init();
    });

    after(async () => {
      if (dummyServer) {
        await dummyServer.dispose();
      }
    });

    it('should choose different port automatically and report Complete without errors', async () => {
      const actualResult = await sut.dryRun(factory.dryRunOptions());
      expect(sut.port).not.eq(dummyServer.port);
      assertions.expectCompleted(actualResult);
    });
  });
});

describe('runMutant', () => {
  // it('should be able to filter tests', async () => {
  //   const testHooks = wrapInClosure(
  //     new JasmineTestFramework().filter([
  //       { id: 0, name: 'Add should be able to add two numbers' },
  //       { id: 3, name: 'Add should be able to recognize a negative number' },
  //     ])
  //   );
  //   const result = await sut.dryRun({ testHooks });
  //   assertions.expectCompleted(result);
  //   expectTestResults(result, [
  //     { name: 'Add should be able to add two numbers', status: TestStatus.Success },
  //     { name: 'Add should be able 1 to a number', status: TestStatus.Skipped },
  //     { name: 'Add should be able negate a number', status: TestStatus.Skipped },
  //     { name: 'Add should be able to recognize a negative number', status: TestStatus.Success },
  //     { name: 'Add should be able to recognize that 0 is not a negative number', status: TestStatus.Skipped },
  //   ]);
  // });
  // describe('with mocha', () => {
  //   let testFramework: MochaTestFramework;
  //   const test0: Readonly<TestSelection> = Object.freeze({
  //     id: 0,
  //     name: 'Add should be able to add two numbers',
  //   });
  //   const test3: Readonly<TestSelection> = {
  //     id: 3,
  //     name: 'Add should be able to recognize a negative number',
  //   };
  //   before(() => {
  //     testFramework = new MochaTestFramework();
  //     setOptions(['testResources/sampleProject/src/Add.js', 'testResources/sampleProject/test-mocha/AddSpec.js']);
  //     (testInjector.options as KarmaRunnerOptionsWithStrykerOptions).karma.config!.frameworks = ['mocha', 'chai'];
  //     sut = createSut();
  //     return sut.init();
  //   });
  //   it('should report completed tests', async () => {
  //     const runResult = await sut.dryRun(factory.dryRunOptions());
  //     assertions.expectCompleted(runResult);
  //     expectToHaveSuccessfulTests(runResult, 5);
  //     expectToHaveFailedTests(runResult, []);
  //   });
  //   it('should be able to filter tests', async () => {
  //     const testHooks = wrapInClosure(testFramework.filter([test0, test3]));
  //     const actualResult = await sut.dryRun({ testHooks });
  //     assertions.expectCompleted(actualResult);
  //     expectToHaveSuccessfulTests(actualResult, 2);
  //     expect(actualResult.tests[0].name).eq(test0.name);
  //     expect(actualResult.tests[1].name).eq(test3.name);
  //   });
  //   it('should be able to clear the filter after a filtered run', async () => {
  //     await sut.dryRun({ testHooks: wrapInClosure(testFramework.filter([test0, test3])) });
  //     const actualResult = await sut.dryRun({ testHooks: wrapInClosure(testFramework.filter([])) });
  //     assertions.expectCompleted(actualResult);
  //     expect(actualResult.tests).lengthOf(5);
  //   });
  // });
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
    await promisify(this.httpServer.listen.bind(this.httpServer))(0, '0.0.0.0');
  }

  public dispose(): Promise<void> {
    return promisify(this.httpServer.close.bind(this.httpServer))();
  }
}
function isFailed(t: TestResult): t is FailedTestResult {
  return t.status === TestStatus.Failed;
}
