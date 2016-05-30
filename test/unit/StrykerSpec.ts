'use strict';

import Stryker from '../../src/Stryker';
import {InputFile} from '../../src/api/core';
import {MutantResult} from '../../src/api/report';
import {Config, ConfigWriterFactory, ConfigWriter} from '../../src/api/config';
import {RunResult, TestResult} from '../../src/api/test_runner';
import {expect} from 'chai';
import * as sinon from 'sinon';
import * as inputFileResolver from '../../src/InputFileResolver';
import * as configReader from '../../src/ConfigReader';
import * as testRunnerOrchestrator from '../../src/TestRunnerOrchestrator';
import * as pluginLoader from '../../src/PluginLoader';
import log from '../helpers/log4jsMock';

class FakeConfigWriter implements ConfigWriter {
  constructor() { }
  write(config: Config) {
    config.testRunner = 'fakeTestRunner';
  }
}

describe('Stryker', function () {
  let sut: Stryker;
  let sandbox: sinon.SinonSandbox;
  let inputFileResolverStub: any;
  let testRunnerOrchestratorStub: any;
  let inputFiles: InputFile[];
  let initialRunResults: RunResult[];
  let configReaderMock: any, pluginLoaderMock: any;
  let config: any;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    config = {};
    configReaderMock = {
      readConfig: sandbox.stub().returns(config)
    };
    pluginLoaderMock = {
      load: sandbox.stub()
    };
    sandbox.stub(configReader, 'default').returns(configReaderMock);
    sandbox.stub(pluginLoader, 'default').returns(pluginLoaderMock);
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

  describe('constructor', () => {
    beforeEach(() => {
      ConfigWriterFactory.instance().register('FakeConfigWriter', FakeConfigWriter);
      sut = new Stryker({});
    });

    it('should use the config writer to override config', () => {
      expect(sut.config.testRunner).to.be.eq('fakeTestRunner');
    });
    
    it('should freeze the config', () => {
      expect(Object.isFrozen(sut.config)).to.be.eq(true);
    });
  });

  describe('runMutationTest()', () => {

    describe('when input file globbing results in a rejection', () => {
      beforeEach(() => {
        inputFileResolverStub = {
          resolve: sandbox.stub().returns(Promise.reject(['a rejection']))
        }
        sandbox.stub(inputFileResolver, 'default').returns(inputFileResolverStub);
        sut = new Stryker({});
      });

      itShouldResultInARejection();
    });

    describe('with correct input file globbing', () => {
      beforeEach(() => {
        inputFiles = [{ path: 'someFile', shouldMutate: true }];
        inputFileResolverStub = {
          resolve: sandbox.stub().returns(Promise.resolve(inputFiles))
        }
        config.plugins = ['plugin1'];
        sandbox.stub(inputFileResolver, 'default').returns(inputFileResolverStub);
        sut = new Stryker({ mutate: ['mutateFile'], files: ['allFiles'] });
      });

      it('should load plugins', () => {
        expect(pluginLoader.default).to.have.been.calledWith(config.plugins);
        expect(pluginLoaderMock.load).to.have.been.calledWith();
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
        let strykerPromise: Promise<MutantResult[]>;

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
            expect(log.error).to.have.been.calledWith('One or more tests errored in the initial test run:\n\tAn error!');
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
  });

  afterEach(() => {
    sandbox.restore();
  });

});
