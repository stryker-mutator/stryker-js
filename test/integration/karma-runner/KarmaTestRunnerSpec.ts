'use strict';

import * as chai from 'chai';
import KarmaTestRunner from '../../../src/karma-runner/KarmaTestRunner';
import {TestResult, RunnerOptions, RunResult} from '../../../src/api/test_runner';
import * as chaiAsPromised from 'chai-as-promised';
import FileUtils from '../../../src/utils/FileUtils';
chai.use(chaiAsPromised);
let expect = chai.expect;

describe('KarmaTestRunner', function() {

  var sut: KarmaTestRunner;
  var fileUtils: FileUtils;
  this.timeout(10000);

  beforeEach(() => {
    fileUtils = new FileUtils();
    fileUtils.createBaseTempFolder();
  });

  describe('when code coverage is enabled', () => {
    let testRunnerOptions: RunnerOptions;

    beforeEach(() => {
      testRunnerOptions = { port: 9877, tempFolder: fileUtils.getBaseTempFolder(), coverageEnabled: true };
    });

    describe('with simple add function to test', () => {

      beforeEach(() => {
        sut = new KarmaTestRunner(['test/sampleProject/src/Add.js'], ['test/sampleProject/test/AddSpec.js'], testRunnerOptions, {});
      });
      

      it('should report completed tests with code coverage', () => {
        return expect(sut.run()).to.eventually.satisfy((testResult: RunResult) => {
          expect(testResult.succeeded).to.be.eq(5);
          expect(testResult.failed).to.be.eq(0);
          expect(testResult.result).to.be.eq(TestResult.Complete);
          let coverageOfFirstFile = testResult.coverage[Object.keys(testResult.coverage)[0]];
          expect(coverageOfFirstFile.statementMap).to.be.ok;
          expect(coverageOfFirstFile.s).to.be.ok;
          return true;
        });
      });
      
    });
  });

});