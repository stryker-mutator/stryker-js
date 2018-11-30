import { expect } from 'chai';
import * as http from 'http';
import { CoverageCollection, RunnerOptions, RunResult, RunStatus, TestStatus } from 'stryker-api/test_runner';
import KarmaTestRunner from '../../src/KarmaTestRunner';
import JasmineTestFramework from 'stryker-jasmine/src/JasmineTestFramework';
import { expectTestResults } from '../helpers/assertions';
import { promisify } from '@stryker-mutator/util';

function wrapInClosure(codeFragment: string) {
  return `
    (function (window) {
      ${codeFragment}
    })((Function('return this'))());`;
}

describe('KarmaTestRunner', () => {

  let sut: KarmaTestRunner;

  const expectToHaveSuccessfulTests = (result: RunResult, n: number) => {
    expect(result.tests.filter(t => t.status === TestStatus.Success)).to.have.length(n);
  };
  const expectToHaveFailedTests = (result: RunResult, expectedFailureMessages: string[]) => {
    const actualFailedTests = result.tests.filter(t => t.status === TestStatus.Failed);
    expect(actualFailedTests).to.have.length(expectedFailureMessages.length);
    actualFailedTests.forEach(failedTest => {
      const actualFailedMessage = failedTest.failureMessages ? failedTest.failureMessages[0].split('\n')[0] : '';
      expect(actualFailedMessage).to.be.oneOf(expectedFailureMessages);
    });
  };

  describe('when all tests succeed', () => {
    let testRunnerOptions: RunnerOptions;

    before(() => {
      testRunnerOptions = {
        fileNames: [],
        port: 9877,
        settings: {
          config: {
            files: [
              'testResources/sampleProject/src/Add.js',
              'testResources/sampleProject/test/AddSpec.js'
            ]
          }
        }
      };
    });

    describe('with simple add function to test', () => {

      before(() => {
        sut = new KarmaTestRunner(testRunnerOptions);
        return sut.init();
      });

      it('should report completed tests', () => {
        return expect(sut.run({})).to.eventually.satisfy((runResult: RunResult) => {
          expectToHaveSuccessfulTests(runResult, 5);
          expectToHaveFailedTests(runResult, []);
          expect(runResult.status).to.be.eq(RunStatus.Complete);
          return true;
        });
      });

      it('should be able to run twice in quick succession',
        () => expect(sut.run({}).then(() => sut.run({}))).to.eventually.have.property('status', RunStatus.Complete));

      it('should be able to filter tests', async () => {
        const testHooks = wrapInClosure(new JasmineTestFramework().filter([
          { id: 0, name: 'Add should be able to add two numbers' },
          { id: 3, name: 'Add should be able to recognize a negative number' }
        ]));
        const result = await sut.run({ testHooks });
        expectTestResults(result, [
          { name: 'Add should be able to add two numbers', status: TestStatus.Success },
          { name: 'Add should be able 1 to a number', status: TestStatus.Skipped },
          { name: 'Add should be able negate a number', status: TestStatus.Skipped },
          { name: 'Add should be able to recognize a negative number', status: TestStatus.Success },
          { name: 'Add should be able to recognize that 0 is not a negative number', status: TestStatus.Skipped }
        ]);
      });
    });
  });

  describe('when some tests fail', () => {
    before(() => {
      const testRunnerOptions: RunnerOptions = {
        fileNames: [],
        port: 9878,
        settings: {
          config: {
            files: [
              'testResources/sampleProject/src/Add.js',
              'testResources/sampleProject/test/AddSpec.js',
              'testResources/sampleProject/test/AddFailedSpec.js'
            ]
          }
        }
      };
      sut = new KarmaTestRunner(testRunnerOptions);
      return sut.init();
    });

    it('should report failed tests', () => {
      return expect(sut.run({})).to.eventually.satisfy((runResult: RunResult) => {
        expectToHaveSuccessfulTests(runResult, 5);
        expectToHaveFailedTests(runResult, ['Expected 7 to be 8.', 'Expected 3 to be 4.']);
        expect(runResult.status).to.be.eq(RunStatus.Complete);
        return true;
      });
    });
  });

  describe('when an error occurs while running tests', () => {

    before(() => {
      const testRunnerOptions = {
        fileNames: [],
        port: 9879,
        settings: {
          config: {
            files: [
              'testResources/sampleProject/src/Add.js',
              'testResources/sampleProject/src/Error.js',
              'testResources/sampleProject/test/AddSpec.js'
            ]
          }
        }
      };
      sut = new KarmaTestRunner(testRunnerOptions);
      return sut.init();
    });

    it('should report Error with the error message', async () => {
      const runResult = await sut.run({});
      expect(RunStatus[runResult.status]).to.be.eq(RunStatus[RunStatus.Error]);
      expect((runResult.errorMessages as string[]).length).to.equal(1);
      expect((runResult.errorMessages as string[])[0]).include('ReferenceError: Can\'t find variable: someGlobalVariableThatIsNotDeclared');
    });
  });

  describe('when no error occurred and no test is performed', () => {
    before(() => {
      const testRunnerOptions = {
        fileNames: [],
        port: 9880,
        settings: {
          config: {
            files: [
              'testResources/sampleProject/src/Add.js',
              'testResources/sampleProject/test/EmptySpec.js'
            ]
          }
        }
      };
      sut = new KarmaTestRunner(testRunnerOptions);
      return sut.init();
    });

    it('should report Complete without errors', () => {
      return expect(sut.run({})).to.eventually.satisfy((runResult: RunResult) => {
        expectToHaveSuccessfulTests(runResult, 0);
        expectToHaveFailedTests(runResult, []);
        expect(runResult.status).to.be.eq(RunStatus.Complete);
        expect((runResult.errorMessages as string[]).length).to.equal(0);

        return true;
      });
    });
  });

  describe('when adding an error file with included: false', () => {

    before(() => {
      const testRunnerOptions = {
        fileNames: [],
        port: 9881,
        settings: {
          config: {
            files: [
              { pattern: 'testResources/sampleProject/src/Add.js', mutated: true, included: true },
              { pattern: 'testResources/sampleProject/test/AddSpec.js', mutated: false, included: true },
              { pattern: 'testResources/sampleProject/src/Error.js', mutated: false, included: false }
            ]
          }
        }
      };
      sut = new KarmaTestRunner(testRunnerOptions);
      return sut.init();
    });

    it('should report Complete without errors', () => {
      return expect(sut.run({})).to.eventually.satisfy((runResult: RunResult) => {
        expect(runResult.status, JSON.stringify(runResult.errorMessages)).to.be.eq(RunStatus.Complete);
        return true;
      });
    });
  });

  describe('when coverage data is available', () => {

    before(() => {
      const testRunnerOptions: RunnerOptions = {
        fileNames: [],
        port: 9882,
        settings: {
          config: {
            files: [
              'testResources/sampleProject/src-instrumented/Add.js',
              'testResources/sampleProject/test/AddSpec.js'
            ]
          }
        }
      };
      sut = new KarmaTestRunner(testRunnerOptions);
      return sut.init();
    });

    it('should report coverage data', () => expect(sut.run({})).to.eventually.satisfy((runResult: RunResult) => {
      expect(runResult.coverage).to.be.ok;
      expect(runResult.status).to.be.eq(RunStatus.Complete);
      const files = Object.keys(runResult.coverage || {});
      expect(files).to.have.length(1);
      const coverageResult = (runResult.coverage as CoverageCollection)[files[0]];
      expect(coverageResult.s).to.be.ok;
      return true;
    }));
  });

  describe('when specified port is not available', () => {

    let dummyServer: DummyServer;

    before(async () => {
      dummyServer = await DummyServer.create();

      const testRunnerOptions: RunnerOptions = {
        fileNames: [],
        port: dummyServer.port,
        settings: {
          config: {
            files: [
              'testResources/sampleProject/src-instrumented/Add.js',
              'testResources/sampleProject/test/AddSpec.js'
            ]
          }
        }
      };
      sut = new KarmaTestRunner(testRunnerOptions);
      return sut.init();
    });

    after(async () => {
      if (dummyServer) {
        await dummyServer.dispose();
      }
    });

    it('should choose different port automatically and report Complete without errors', async () => {
      const actualResult = await sut.run({});
      expect(sut.port).not.eq(dummyServer.port);
      expect(actualResult.status, JSON.stringify(actualResult.errorMessages)).eq(RunStatus.Complete);
    });
  });
});

class DummyServer {
  private readonly httpServer: http.Server;

  private constructor() {
    this.httpServer = http.createServer();
  }

  get port() {
    const address = this.httpServer.address();
    if (typeof address === 'string') {
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
