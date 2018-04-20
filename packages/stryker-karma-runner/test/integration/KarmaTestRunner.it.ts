import * as fs from 'fs';
import { expect } from 'chai';
import { CoverageCollection, RunnerOptions, RunResult, RunStatus, TestStatus } from 'stryker-api/test_runner';
import KarmaTestRunner from '../../src/KarmaTestRunner';
import JasmineTestFramework from 'stryker-jasmine/src/JasmineTestFramework';


function wrapInClosure(codeFragment: string) {
  return `
    (function (window) {
      ${codeFragment}
    })((Function('return this'))());`;
}

describe('KarmaTestRunner', function () {

  after(() => {
    try {
      fs.unlinkSync('__test_hooks_for_stryker__.js');
    } catch { }
  });

  let sut: KarmaTestRunner;
  this.timeout(10000);

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

  const expectTestResults = (result: RunResult, expectedTestResults: { name: string, status: TestStatus }[]) => {
    const actualTestResults = result.tests.map(test => ({ name: test.name, status: test.status }));
    expect(actualTestResults).to.have.length(expectedTestResults.length);
    expectedTestResults.forEach(expectedTestResult => {
      const actualTestResult = actualTestResults.find(test => test.name === expectedTestResult.name);
      expect(actualTestResult).deep.eq(expectedTestResult);
    });
  };


  describe('when all tests succeed', () => {
    let testRunnerOptions: RunnerOptions;

    before(() => {
      testRunnerOptions = {
        port: 9877,
        strykerOptions: {
          logLevel: 'trace',
          karmaConfig: {
            files: [
              'testResources/sampleProject/src/Add.js',
              'testResources/sampleProject/test/AddSpec.js'
            ]
          }
        },
        fileNames: []
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

      it.only('should be able to filter tests', async () => {
        const testHooks = wrapInClosure(new JasmineTestFramework().filter([
          { id: 0, name: 'Add should be able 1 to a number' },
          { id: 3, name: 'Add should be able negate a number' }
        ]));
        const result = await sut.run({ testHooks });
        expectTestResults(result, [
          { name: 'Add should be able to add two numbers', status: TestStatus.Success },
          { name: 'Add should be able 1 to a number', status: TestStatus.Skipped },
          { name: 'Add should be able negate a number', status: TestStatus.Skipped },
          { name: 'Add should be able to recognize a negative number', status: TestStatus.Success },
          { name: 'Add should be able to recognize that 0 is not a negative number', status: TestStatus.Skipped }
        ]);
        return new Promise((res) => {});
      });

    });
  });

  describe('when some tests fail', () => {
    before(() => {
      const testRunnerOptions = {
        port: 9878,
        strykerOptions: {
          logLevel: 'trace',
          karmaConfig: {
            files: [
              'testResources/sampleProject/src/Add.js',
              'testResources/sampleProject/test/AddSpec.js',
              'testResources/sampleProject/test/AddFailedSpec.js'
            ]
          }
        },
        fileNames: []
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
        port: 9879,
        strykerOptions: {
          karmaConfig: {
            files: [
              'testResources/sampleProject/src/Add.js',
              'testResources/sampleProject/src/Error.js',
              'testResources/sampleProject/test/AddSpec.js'
            ]
          }
        },
        fileNames: []
      };
      sut = new KarmaTestRunner(testRunnerOptions);
      return sut.init();
    });

    it('should report Error with the error message', async () => {
      const runResult = await sut.run({});
      expectToHaveSuccessfulTests(runResult, 5);
      expectToHaveFailedTests(runResult, []);
      expect(runResult.status).to.be.eq(RunStatus.Error);
      expect((runResult.errorMessages as any).length).to.equal(1);
      expect((runResult.errorMessages as any)[0]).include('ReferenceError: Can\'t find variable: someGlobalVariableThatIsNotDeclared');
    });
  });

  describe('when no error occurred and no test is performed', () => {
    before(() => {
      const testRunnerOptions = {
        port: 9880,
        strykerOptions: {
          karmaConfig: {
            files: [
              'testResources/sampleProject/src/Add.js',
              'testResources/sampleProject/test/EmptySpec.js'
            ]
          }
        },
        fileNames: []
      };
      sut = new KarmaTestRunner(testRunnerOptions);
      return sut.init();
    });

    it('should report Complete without errors', () => {
      return expect(sut.run({})).to.eventually.satisfy((runResult: RunResult) => {
        expectToHaveSuccessfulTests(runResult, 0);
        expectToHaveFailedTests(runResult, []);
        expect(runResult.status).to.be.eq(RunStatus.Complete);
        expect((runResult.errorMessages as any).length).to.equal(0);

        return true;
      });
    });
  });

  describe('when adding an error file with included: false', () => {

    before(() => {
      const testRunnerOptions = {
        port: 9881,
        strykerOptions: {
          karmaConfig: {
            files: [
              { pattern: 'testResources/sampleProject/src/Add.js', mutated: true, included: true },
              { pattern: 'testResources/sampleProject/test/AddSpec.js', mutated: false, included: true },
              { pattern: 'testResources/sampleProject/src/Error.js', mutated: false, included: false }
            ]
          }
        },
        fileNames: []
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
        port: 9882,
        strykerOptions: {
          coverageAnalysis: 'all',
          karmaConfig: {
            files: [
              'testResources/sampleProject/src-instrumented/Add.js',
              'testResources/sampleProject/test/AddSpec.js'
            ]
          }
        },
        fileNames: []
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
});
