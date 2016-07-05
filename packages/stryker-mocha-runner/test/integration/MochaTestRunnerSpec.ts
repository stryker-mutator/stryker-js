import * as chai from 'chai';
import MochaTestRunner from '../../src/MochaTestRunner';
import {TestResult, RunnerOptions, RunResult} from 'stryker-api/test_runner';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
let expect = chai.expect;

describe.only('MochaTestRunner', function() {

  var sut: MochaTestRunner;
  this.timeout(10000);

  describe('when code coverage is disabled', () => {
    let testRunnerOptions: RunnerOptions;

    before(() => {
      testRunnerOptions = {
        files: [{ path: 'testResources/sampleProject/src/MyMath.js', shouldMutate: true }, { path: 'testResources/sampleProject/test/MyMathSpec.js', shouldMutate: false }],
        coverageEnabled: false,
        strykerOptions: {},
        port: 1234
      };
    });

    describe('with simple add function to test', () => {

      before(() => {
        sut = new MochaTestRunner(testRunnerOptions);
      });

      it('should report completed tests without coverage', () => {
        return expect(sut.run()).to.eventually.satisfy((testResult: RunResult) => {
          expect(testResult.succeeded).to.be.eq(5, 'Succeeded tests did not match');
          expect(testResult.failed).to.be.eq(0, 'Failed tests did not match');
          expect(testResult.result).to.be.eq(TestResult.Complete, 'Test result did not match');
          expect(testResult.coverage).to.not.be.ok;
          return true;
        });
      });
    });
  });

});