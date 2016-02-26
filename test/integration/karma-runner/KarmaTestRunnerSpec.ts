'use strict';

import {expect} from 'chai';
import KarmaTestRunner from '../../../src/karma-runner/KarmaTestRunner';
import TestResult from '../../../src/api/TestResult';

describe('KarmaTestRunner', () => {

  let sut: KarmaTestRunner;

  describe('with simple add function to test', () => {

    beforeEach(() => {
      sut = new KarmaTestRunner(['test/sampleProject/src/Add.js'], ['test/sampleProject/test/AddSpec.js'], { port: 9877, tempFolder: '.tmp' }, {});
    });

    it('should report completed tests', done => {

      sut.run().then(testResult => {
        try {
          expect(testResult.succeeded).to.be.eq(5);
          expect(testResult.failed).to.be.eq(0);
          expect(testResult.result).to.be.eq(TestResult.Complete);
          let coverageOfFirstFile = testResult.coverage[Object.keys(testResult.coverage)[0]];
          expect(coverageOfFirstFile.statementMap).to.be.ok;
          expect(coverageOfFirstFile.s).to.be.ok;
          done();
        } catch (err) {
          done(err);
        }
      }, err => console.error('ERRPR' + err));
    });
  });

});