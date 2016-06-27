'use strict';

import * as chai from 'chai';
import KarmaTestRunner from '../../src/KarmaTestRunner';
import {TestResult, RunnerOptions, RunResult} from 'stryker-api/test_runner';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
let expect = chai.expect;

describe('KarmaTestRunner', function() {

  var sut: KarmaTestRunner;
  this.timeout(10000);

  describe('when code coverage is enabled', () => {
    let testRunnerOptions: RunnerOptions;

    before(() => {
      testRunnerOptions = {
        files: [{ path: 'testResources/sampleProject/src/Add.js', shouldMutate: true }, { path: 'testResources/sampleProject/test/AddSpec.js', shouldMutate: false }],
        port: 9877,
        coverageEnabled: true,
        strykerOptions: { logLevel: 'trace' }
      };
    });

    describe('with simple add function to test', () => {

      before(() => {
        sut = new KarmaTestRunner(testRunnerOptions);
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

      it('should be able to run twice in quick succession', () => {
        return expect(sut.run().then(() => sut.run())).to.eventually.have.property('succeeded', 5);
      });
    });
  });

  describe('when code coverage is disabled', () => {
    let testRunnerOptions: RunnerOptions;

    before(() => {
      testRunnerOptions = {
        files: [{ path: 'testResources/sampleProject/src/Add.js', shouldMutate: true }, { path: 'testResources/sampleProject/test/AddSpec.js', shouldMutate: false }],
        port: 9878,
        coverageEnabled: false,
        strykerOptions: {}
      };
    });

    describe('with simple add function to test', () => {

      before(() => {
        sut = new KarmaTestRunner(testRunnerOptions);
      });

      it('should report completed tests without coverage', () => {
        return expect(sut.run()).to.eventually.satisfy((testResult: RunResult) => {
          expect(testResult.succeeded).to.be.eq(5);
          expect(testResult.failed).to.be.eq(0);
          expect(testResult.result).to.be.eq(TestResult.Complete);
          expect(testResult.coverage).to.not.be.ok;
          return true;
        });
      });
    });
  });

  describe('when an error occures while running tests', () => {

    before(() => {
      let testRunnerOptions = {
        files: [{ path: 'testResources/sampleProject/src/Error.js', shouldMutate: true }, { path: 'testResources/sampleProject/test/AddSpec.js', shouldMutate: false }],
        port: 9879,
        coverageEnabled: false,
        strykerOptions: {}
      };
      sut = new KarmaTestRunner(testRunnerOptions);
    });

    it('should report Error with the error message', () => {
      return expect(sut.run()).to.eventually.satisfy((testResult: RunResult) => {
        expect(testResult.succeeded).to.be.eq(0);
        expect(testResult.failed).to.be.eq(0);
        expect(testResult.result).to.be.eq(TestResult.Error);
        expect(testResult.errorMessages.length).to.equal(1);
        expect(testResult.errorMessages[0].indexOf('ReferenceError: Can\'t find variable: someGlobalVariableThatIsNotDeclared\nat')).to.eq(0);
        return true;
      });
    });
  })

  describe('when no error occured and no test is performed', () => {
    before(() => {
      let testRunnerOptions = {
        files: [{ path: 'testResources/sampleProject/src/Add.js', shouldMutate: true }, { path: 'testResources/sampleProject/test/EmptySpec.js', shouldMutate: true }],
        port: 9880,
        coverageEnabled: false,
        strykerOptions: {}
      };
      sut = new KarmaTestRunner(testRunnerOptions);
    });

    it('should report Complete without errors', () => {
      return expect(sut.run()).to.eventually.satisfy((testResult: RunResult) => {
        expect(testResult.succeeded).to.be.eq(0);
        expect(testResult.failed).to.be.eq(0);
        expect(testResult.result).to.be.eq(TestResult.Complete);
        expect(testResult.errorMessages.length).to.equal(0);
        return true;
      });
    });
  });

});