'use strict';

import Stryker from '../../src/Stryker';
import {InputFile} from '../../src/api/core';
import {RunResult, TestResult} from '../../src/api/test_runner';
import {expect} from 'chai';
import * as sinon from 'sinon';
import * as inputFileResolver from '../../src/InputFileResolver';
import * as testRunnerOrchestrator from '../../src/TestRunnerOrchestrator';

describe('Stryker runMutationTest()', function() {
  let sut: Stryker;
  let sandbox: sinon.SinonSandbox;
  let inputFileResolverStub: any;
  let testRunnerOrchestratorStub: any;
  let inputFiles: InputFile[];
  let initialRunResults: RunResult[];
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(console, 'log');
  });

  function itShouldResultInARejection() {
    it('should result in a rejection', (done) => {
      sut.runMutationTest().then(() => {
        done(new Error('Stryker resolved while a rejection was expected'));
      }, () => {
        done();
      });
    });
  }

  describe('when input file globbing results in a rejection', () => {
    beforeEach(() => {
      inputFileResolverStub = {
        resolve: sandbox.stub().returns(Promise.reject(['a rejection']))
      }
      sandbox.stub(inputFileResolver, 'default').returns(inputFileResolverStub);
      sut = new Stryker(null, null);
    });

    itShouldResultInARejection();
  });

  describe('with correct input file globbing', () => {
    beforeEach(() => {
      inputFiles = [{ path: 'someFile', shouldMutate: true }];
      inputFileResolverStub = {
        resolve: sandbox.stub().returns(Promise.resolve(inputFiles))
      }
      sandbox.stub(inputFileResolver, 'default').returns(inputFileResolverStub);
      sut = new Stryker(['mutateFile'], ['allFiles']);
    });

    describe('when recordCoverage() resulted in a rejection', () => {

      beforeEach(() => {
        testRunnerOrchestratorStub = { recordCoverage: sandbox.stub().returns(Promise.reject('a rejection')) };
        sandbox.stub(testRunnerOrchestrator, 'default').returns(testRunnerOrchestratorStub);
      });
      
      itShouldResultInARejection();
    });

    describe('when coverage can be collected', () => {
      let runMutationsPromiseResolve: () => any;
      let strykerPromise: Promise<void>;

      beforeEach(() => {
        initialRunResults = [];
        testRunnerOrchestratorStub = {
          recordCoverage: sandbox.stub().returns(Promise.resolve(initialRunResults)),
          runMutations: sandbox.stub().returns(new Promise(res => runMutationsPromiseResolve = res))
        };
        sandbox.stub(testRunnerOrchestrator, 'default').returns(testRunnerOrchestratorStub);
      });

      describe('but contains an error and failed tests', () => {

        beforeEach((done) => {
          initialRunResults.push({ result: TestResult.Error, errorMessages: ['An error!'] })
          strykerPromise = sut.runMutationTest();
          strykerPromise.then(() => done(), () => done());
        });

        it('should have logged the errors', () => {
          expect(console.log).to.have.been.calledWith('ERROR: One or more tests errored in the initial test run:');
          expect(console.log).to.have.been.calledWith('\t', 'An error!');
        });

        itShouldResultInARejection();
      });

      describe('without errors or failed tests', () => {

        beforeEach(() => {
          strykerPromise = sut.runMutationTest();
        });

        it('should not directly resolve the stryker promise', (done) => {
          let resolved = false;
          strykerPromise.then(() => resolved = true);
          setTimeout(() => {
            expect(resolved).to.be.eq(false);
            done();
          }, 100);
        });

        describe('and running of mutators was successfull', () => {
          beforeEach(() => {
            runMutationsPromiseResolve();
          });

          it('should resolve the stryker promise', () => {
            return strykerPromise;
          });
        });
      });
    });

  });

  afterEach(() => {
    sandbox.restore();
  });

});
