'use strict';

import * as chai from 'chai';
import KarmaTestRunner from '../../../src/karma-runner/KarmaTestRunner';
import TestResult from '../../../src/api/TestResult';
import TestRunResult from '../../../src/api/TestRunResult';
import * as chaiAsPromised from 'chai-as-promised';
import FileUtils from '../../../src/utils/FileUtils';
chai.use(chaiAsPromised);
let expect = chai.expect;

describe('KarmaTestRunner', function() {

  var sut: KarmaTestRunner;
  var fileUtils: FileUtils;
  this.timeout(10000);

  describe('with simple add function to test', () => {

    beforeEach(() => {
      fileUtils = new FileUtils();
      fileUtils.createBaseTempFolder();
      sut = new KarmaTestRunner(['test/sampleProject/src/Add.js'], ['test/sampleProject/test/AddSpec.js'], { port: 9877, tempFolder: fileUtils.getBaseTempFolder() }, {});
    });

    it('should report completed tests', function() {
      return expect(sut.run()).to.eventually.satisfy((testResult: TestRunResult) => {
        console.log('asserting');
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