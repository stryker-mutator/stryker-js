import * as chai from 'chai';
import JestTestRunner from '../../src/JestTestRunner';
import { RunnerOptions, RunResult, RunStatus, TestStatus } from 'stryker-api/test_runner';
import { FileKind, FileDescriptor } from 'stryker-api/core';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
let expect = chai.expect;

describe('JestTestRunner', function () {
    let sut: JestTestRunner;
    this.timeout(10000);

    const expectToHaveSuccessfulTests = (result: RunResult, n: number) => {
        expect(result.tests.filter(t => t.status === TestStatus.Success)).to.have.length(n);
    };

    const expectToHaveFailedTests = (result: RunResult, expectedFailureMessages: string[]) => {
        const actualFailedTests = result.tests.filter(t => t.status === TestStatus.Failed);
        expect(actualFailedTests).to.have.length(expectedFailureMessages.length);
        actualFailedTests.forEach(failedTest => expect(failedTest.failureMessages[0]).to.contain(expectedFailureMessages.shift()));
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
                    file({ name: 'testResources/sampleProject/src/__tests__/AddSpec.js', mutated: false })],
                port: 9877,
                strykerOptions: { logLevel: 'trace' }
            };
        });

        describe('with simple add function to test', () => {
            before(() => {
                sut = new JestTestRunner(testRunnerOptions);
                return sut.init();
            });

            it('should report completed tests', () => {
                return expect(sut.run()).to.eventually.satisfy((runResult: RunResult) => {
                    expectToHaveSuccessfulTests(runResult, 5);
                    expectToHaveFailedTests(runResult, []);
                    expect(runResult.status).to.be.eq(RunStatus.Complete);
                    expect(runResult.errorMessages).to.have.length(0);
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
                    file({ name: 'testResources/sampleProject/src/__tests__/AddSpec.js', mutated: false }),
                    file({ name: 'testResources/sampleProject/src/__tests__/AddFailedSpec.js', mutated: false })],
                port: 9878,
                strykerOptions: { logLevel: 'trace' }
            };
            sut = new JestTestRunner(testRunnerOptions);
            return sut.init();
        });

        it('should report failed tests', () => {
            return expect(sut.run()).to.eventually.satisfy((runResult: RunResult) => {
                expectToHaveSuccessfulTests(runResult, 5);
                expectToHaveFailedTests(runResult, [
                    // There seems no way to disable colored output in Jest, so color codes must be included here.
                    'Expected value to be (using ===):\n  \u001b[32m8\u001b[39m\nReceived:\n  \u001b[31m7\u001b[39m\n',
                    'Expected value to be (using ===):\n  \u001b[32m4\u001b[39m\nReceived:\n  \u001b[31m3\u001b[39m\n'
                ]);
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
                    file({ name: 'testResources/sampleProject/src/__tests__/ErrorSpec.js', mutated: true })],
                port: 9879,
                strykerOptions: { logLevel: 'trace' }
            };
            sut = new JestTestRunner(testRunnerOptions);
            return sut.init();
        });

        it('should report Error with the error message', () => {
            return expect(sut.run()).to.eventually.satisfy((runResult: RunResult) => {
                expectToHaveSuccessfulTests(runResult, 0);
                expectToHaveFailedTests(runResult, []);
                expect(runResult.status).to.be.eq(RunStatus.Error);
                expect(runResult.errorMessages.length).to.equal(1);
                expect(runResult.errorMessages[0]).to.contain('ReferenceError: someGlobalVariableThatIsNotDeclared is not defined');
                return true;
            });
        });
    });

    describe('when no error occurred and no test is performed', () => {

        before(() => {
            const testRunnerOptions = {
                files: [
                    file({ name: 'testResources/sampleProject/src/Add.js', mutated: true }),
                    file({ name: 'testResources/sampleProject/src/__tests__/EmptySpec.js', mutated: true })],
                port: 9880,
                strykerOptions: {}
            };
            sut = new JestTestRunner(testRunnerOptions);
            return sut.init();
        });

        it('should report Complete without errors', () => {
            return expect(sut.run()).to.eventually.satisfy((runResult: RunResult) => {
                expectToHaveSuccessfulTests(runResult, 0);

                expectToHaveFailedTests(runResult, []);
                expect(runResult.status).to.be.eq(RunStatus.Complete);
                expect(runResult.errorMessages.length).to.equal(0);
                return true;
            });
        });
    });

    describe('when adding an error file with included: false', () => {

        before(() => {
            const testRunnerOptions = {
                files: [
                    file({ name: 'testResources/sampleProject/src/Add.js', mutated: true }),
                    file({ name: 'testResources/sampleProject/src/__tests__/AddSpec.js', mutated: false }),
                    file({ name: 'testResources/sampleProject/src/Error.js', mutated: false, included: false })],
                port: 9881,
                strykerOptions: {}
            };
            sut = new JestTestRunner(testRunnerOptions);
            return sut.init();
        });

        it('should report Complete without errors', () => {
            return expect(sut.run()).to.eventually.satisfy((runResult: RunResult) => {
                expect(runResult.status).to.be.eq(RunStatus.Complete);
                return true;
            });
        });
  });

  describe('when testing roots option project (jest^19)', () => {
    before(() => {
      const testRunnerOptions = {
        files: [
          file({ name: 'testResources/roots-option-project/lib/isAdult.js', mutated: true, included: false }),
          file({ name: 'testResources/roots-option-project/__tests__/isAdult.spec.js', mutated: false })
        ],
        port: 9882,
        strykerOptions: {}
      };
      sut = new JestTestRunner(testRunnerOptions);
      return sut.init();
    });

    it('should report Complete without errors', () => {
      return expect(sut.run()).to.eventually.satisfy((runResult: RunResult) => {
        expect(runResult.errorMessages.join(',')).eq('');
        expect(runResult.status).to.be.eq(RunStatus.Complete);
        return true;
      });
    });
  });

});
