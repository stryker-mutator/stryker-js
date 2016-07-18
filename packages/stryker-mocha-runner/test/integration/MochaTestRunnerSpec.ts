import * as chai from 'chai';
import MochaTestRunner from '../../src/MochaTestRunner';
import {TestResult, RunnerOptions, RunResult} from 'stryker-api/test_runner';
import * as chaiAsPromised from 'chai-as-promised';
import * as path from 'path';
chai.use(chaiAsPromised);
let expect = chai.expect;

describe('MochaTestRunner', function () {

  var sut: MochaTestRunner;
  this.timeout(10000);

  describe('when code coverage is disabled', () => {
    let testRunnerOptions: RunnerOptions;

    before(() => {
      testRunnerOptions = {
        files: [
          file('./testResources/sampleProject/src/MyMath.js'),
          file('./testResources/sampleProject/test/MyMathSpec.js')],
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

      it('should be able to run 2 times in a row', () => {
        return expect(sut.run().then(() => sut.run())).to.eventually.satisfy((testResult: RunResult) => {
          expect(testResult.succeeded).to.be.eq(5);
          return true;
        });
      });
    });

    describe('with an error in an unincluded input file', () => {
      before(() => {
        let options = {
          files: [
            file('testResources/sampleProject/src/MyMath.js'),
            file('testResources/sampleProject/src/Error.js', false, false),
            file('testResources/sampleProject/test/MyMathSpec.js')],
          coverageEnabled: false,
          strykerOptions: {},
          port: 1234
        };
        sut = new MochaTestRunner(options);
      });

      it('should report completed tests without errors', () => expect(sut.run()).to.eventually.satisfy((testResult: RunResult) => {
        expect(testResult.result).to.be.eq(TestResult.Complete, 'Test result did not match');
        return true;
      }));
    });
  });

  let file = (filePath: string, mutated: boolean = true, included: boolean = true) => ({ path: path.resolve(filePath), mutated, included });
});