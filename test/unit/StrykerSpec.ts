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

  describe('with correct input file globbing', () => {
    beforeEach(() => {
      inputFiles = [{ path: 'someFile', shouldMutate: true }];
      inputFileResolverStub = {
        resolve: sandbox.stub().returns(Promise.resolve(inputFiles))
      }
      sandbox.stub(inputFileResolver, 'default').returns(inputFileResolverStub);
      sut = new Stryker(['mutateFile'], ['allFiles']);
    });

    describe('when coverage can be collected', () => {

      beforeEach(() => {
        initialRunResults = [];
        testRunnerOrchestratorStub = {
          recordCoverage: sandbox.stub().returns(Promise.resolve(initialRunResults))
        };
        sandbox.stub(testRunnerOrchestrator, 'default').returns(testRunnerOrchestratorStub);
      });

      describe('but contains an error and failed tests', () => {

        beforeEach(() => {
          initialRunResults.push({result: TestResult.Error, errorMessages: ['An error!']})
          return sut.runMutationTest();
        });
        
        it('should have logged the errors', () => {
          expect(console.log).to.have.been.calledWith('ERROR: One or more tests errored in the initial test run:');
          expect(console.log).to.have.been.calledWith('\t', 'An error!');
        });
      });
    });

  });

  afterEach(() => {
    sandbox.restore();
  });

});
