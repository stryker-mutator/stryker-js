import { expect } from 'chai';
import { CoverageCollection, RunnerOptions, RunResult, RunStatus, TestStatus } from 'stryker-api/test_runner';
import { FileKind, FileDescriptor } from 'stryker-api/core';
import KarmaTestRunner from '../../src/KarmaTestRunner';

describe('KarmaTestRunner', function () {

  let sut: KarmaTestRunner;
  this.timeout(10000);

  let expectToHaveSuccessfulTests = (result: RunResult, n: number) => {
    expect(result.tests.filter(t => t.status === TestStatus.Success)).to.have.length(n);
  };
  let expectToHaveFailedTests = (result: RunResult, expectedFailureMessages: string[]) => {
    const actualFailedTests = result.tests.filter(t => t.status === TestStatus.Failed);
    expect(actualFailedTests).to.have.length(expectedFailureMessages.length);
    actualFailedTests.forEach(failedTest => expect((failedTest.failureMessages as any)[0]).to.contain(expectedFailureMessages.shift() as any));
  };

  function file(overrides?: Partial<FileDescriptor>): FileDescriptor {
    return Object.assign({}, {
      name: 'file.js',
      transpiled: true,
      included: true,
      mutated: true,
      kind: FileKind.Text
    }, overrides);
  }

  describe('when all tests succeed', () => {
    let testRunnerOptions: RunnerOptions;

    before(() => {
      testRunnerOptions = {
        files: [
          file({ name: 'testResources/sampleProject/src/Add.js', mutated: true }),
          file({ name: 'testResources/sampleProject/test/AddSpec.js', mutated: false })],
        port: 9877,
        strykerOptions: { logLevel: 'trace' }
      };
    });

    describe('with simple add function to test', () => {

      before(() => {
        sut = new KarmaTestRunner(testRunnerOptions);
        return sut.init();
      });

      it('should report completed tests', () => {
        return expect(sut.run()).to.eventually.satisfy((runResult: RunResult) => {
          expectToHaveSuccessfulTests(runResult, 5);
          expectToHaveFailedTests(runResult, []);
          expect(runResult.status).to.be.eq(RunStatus.Complete);
          return true;
        });
      });

      it('should be able to run twice in quick succession',
        () => expect(sut.run().then(() => sut.run())).to.eventually.have.property('status', RunStatus.Complete));
    });
  });

  describe('when some tests fail', () => {
    before(() => {
      const testRunnerOptions = {
        files: [
          file({ name: 'testResources/sampleProject/src/Add.js', mutated: true }),
          file({ name: 'testResources/sampleProject/test/AddSpec.js', mutated: false }),
          file({ name: 'testResources/sampleProject/test/AddFailedSpec.js', mutated: false })
        ],
        port: 9878,
        strykerOptions: { logLevel: 'trace' }
      };
      sut = new KarmaTestRunner(testRunnerOptions);
      return sut.init();
    });

    it('should report failed tests', () => {
      return expect(sut.run()).to.eventually.satisfy((runResult: RunResult) => {
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
        files: [
          file({ name: 'testResources/sampleProject/src/Error.js', mutated: true }),
          file({ name: 'testResources/sampleProject/test/AddSpec.js', mutated: true })
        ],
        port: 9879,
        strykerOptions: {}
      };
      sut = new KarmaTestRunner(testRunnerOptions);
      return sut.init();
    });

    it('should report Error with the error message', async () => {
      const runResult = await sut.run();
      expectToHaveSuccessfulTests(runResult, 0);
      expectToHaveFailedTests(runResult, []);
      expect(runResult.status).to.be.eq(RunStatus.Error);
      expect((runResult.errorMessages as any).length).to.equal(1);
      expect((runResult.errorMessages as any)[0]).include('ReferenceError: Can\'t find variable: someGlobalVariableThatIsNotDeclared\nat');
    });
  });

  describe('when no error occurred and no test is performed', () => {
    before(() => {
      const testRunnerOptions = {
        files: [
          file({ name: 'testResources/sampleProject/src/Add.js' }),
          file({ name: 'testResources/sampleProject/test/EmptySpec.js' })
        ],
        port: 9880,
        strykerOptions: {}
      };
      sut = new KarmaTestRunner(testRunnerOptions);
      return sut.init();
    });

    it('should report Complete without errors', () => {
      return expect(sut.run()).to.eventually.satisfy((runResult: RunResult) => {
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
        files: [
          file({ name: 'testResources/sampleProject/src/Add.js', mutated: true, included: true }),
          file({ name: 'testResources/sampleProject/test/AddSpec.js', mutated: false, included: true }),
          file({ name: 'testResources/sampleProject/src/Error.js', mutated: false, included: false })
        ],
        port: 9881,
        strykerOptions: {}
      };
      sut = new KarmaTestRunner(testRunnerOptions);
      return sut.init();
    });

    it('should report Complete without errors', () => {
      return expect(sut.run()).to.eventually.satisfy((runResult: RunResult) => {
        expect(runResult.status).to.be.eq(RunStatus.Complete);
        return true;
      });
    });
  });

  describe('when coverage data is available', () => {

    before(() => {
      const testRunnerOptions: RunnerOptions = {
        files: [
          file({ name: 'testResources/sampleProject/src-instrumented/Add.js', mutated: true }),
          file({ name: 'testResources/sampleProject/test/AddSpec.js', mutated: false })
        ],
        port: 9882,
        strykerOptions: { coverageAnalysis: 'all' }
      };
      sut = new KarmaTestRunner(testRunnerOptions);
      return sut.init();
    });

    it('should report coverage data', () => expect(sut.run()).to.eventually.satisfy((runResult: RunResult) => {
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