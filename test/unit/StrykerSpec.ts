'use strict';

import Stryker from '../../src/Stryker';
import {InputFile} from 'stryker-api/core';
import {MutantResult, Reporter} from 'stryker-api/report';
import {Config, ConfigWriterFactory, ConfigWriter} from 'stryker-api/config';
import {RunResult, TestResult} from 'stryker-api/test_runner';
import {TestSelector} from 'stryker-api/test_selector';
import {expect} from 'chai';
import * as sinon from 'sinon';
import * as inputFileResolver from '../../src/InputFileResolver';
import * as configReader from '../../src/ConfigReader';
import * as testSelectorOrchestrator from '../../src/TestSelectorOrchestrator';
import * as testRunnerOrchestrator from '../../src/TestRunnerOrchestrator';
import * as reporterOrchestrator from '../../src/ReporterOrchestrator';
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
  let testSelector: any;
  let inputFileResolverStub: any;
  let testRunnerOrchestratorStub: any;
  let testSelectorOrchestratorStub: any;
  let inputFiles: InputFile[];
  let initialRunResults: RunResult[];
  let config: any;
  let reporter: Reporter, configReaderMock: any, pluginLoaderMock: any;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    config = {};
    reporter = {
      onSourceFileRead: sandbox.stub(),
      onAllSourceFilesRead: sandbox.stub(),
      onMutantTested: sandbox.stub(),
      onAllMutantsTested: sandbox.stub(),
      wrapUp: sandbox.stub()
    };
    configReaderMock = {
      readConfig: sandbox.stub().returns(config)
    };
    pluginLoaderMock = {
      load: sandbox.stub()
    };
    let reporterOrchestratorMock = {
      createBroadcastReporter: () => reporter
    };
    testSelector = 'some test selector';
    testSelectorOrchestratorStub = {
      determineTestSelector: sandbox.stub().returns(testSelector)
    };

    sandbox.stub(testSelectorOrchestrator, 'default').returns(testSelectorOrchestratorStub);
    sandbox.stub(reporterOrchestrator, 'default').returns(reporterOrchestratorMock);
    sandbox.stub(configReader, 'default').returns(configReaderMock);
    sandbox.stub(pluginLoader, 'default').returns(pluginLoaderMock);
  });

  function actAndShouldResultInARejection() {
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
      config.plugins = ['plugin1'];
      sut = new Stryker({});
    });

    it('should use the config writer to override config', () => {
      expect(sut.config.testRunner).to.be.eq('fakeTestRunner');
    });

    it('should freeze the config', () => {
      expect(Object.isFrozen(sut.config)).to.be.eq(true);
    });

    it('should load plugins', () => {
      expect(pluginLoader.default).to.have.been.calledWith(config.plugins);
      expect(pluginLoaderMock.load).to.have.been.calledWith();
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

      actAndShouldResultInARejection();
    });

    describe('with correct input file globbing', () => {
      beforeEach(() => {
        inputFiles = [{ path: 'someFile', mutated: true, included: true }];
        inputFileResolverStub = {
          resolve: sandbox.stub().returns(Promise.resolve(inputFiles))
        }
        testRunnerOrchestratorStub = {
          initialRun: sandbox.stub(),
          runMutations: sandbox.stub()
        };
        sandbox.stub(testRunnerOrchestrator, 'default').returns(testRunnerOrchestratorStub);
        sandbox.stub(inputFileResolver, 'default').returns(inputFileResolverStub);
        sut = new Stryker({ mutate: ['mutateFile'], files: ['allFiles'] });
      });

      describe('when initialRun() resulted in a rejection', () => {

        beforeEach(() => {
          testRunnerOrchestratorStub.initialRun.returns(Promise.reject('a rejection'));
        });

        actAndShouldResultInARejection();
      });

      describe('when coverage can be collected', () => {
        let runMutationsPromiseResolve: () => any;
        let strykerPromise: Promise<any>;

        beforeEach(() => {
          initialRunResults = [];
          testRunnerOrchestratorStub.initialRun.returns(Promise.resolve(initialRunResults));
          testRunnerOrchestratorStub.runMutations.returns(new Promise(res => runMutationsPromiseResolve = res));
        });

        describe('but contains an error and failed tests', () => {
          beforeEach((done) => {
            initialRunResults.push({ result: TestResult.Error, errorMessages: ['An error!'] })
            strykerPromise = sut.runMutationTest();
            strykerPromise.then(() => done(), () => done());
          });

          it('should create the testRunnerOrchestrator', () => {
            expect(testRunnerOrchestrator.default).to.have.been.calledWithNew;
            expect(testRunnerOrchestrator.default).to.have.been.calledWith(config, inputFiles, testSelector, reporter);
          });

          it('should have logged the errors', () => {
            expect(log.error).to.have.been.calledWith('One or more tests errored in the initial test run:\n\tAn error!');
          });

          actAndShouldResultInARejection();
        });

        describe('without errors or failed tests', () => {
          let strykerPromiseResolved: boolean;
          beforeEach(() => {
            initialRunResults.push({ result: TestResult.Complete, succeeded: 5 });
            initialRunResults.push({ result: TestResult.Complete, succeeded: 1 });
            strykerPromiseResolved = false
            strykerPromise = sut.runMutationTest().then(() => strykerPromiseResolved = true);
          });

          it('should determine the testSelector', () => {
            expect(testSelectorOrchestrator.default).to.have.been.calledWithNew;
            expect(testSelectorOrchestrator.default).to.have.been.calledWith(config);
            expect(testSelectorOrchestratorStub.determineTestSelector).to.have.been.called;
          });

          it('should not directly resolve the stryker promise', (done) => {
            setTimeout(() => {
              expect(strykerPromiseResolved).to.be.eq(false);
              done();
            }, 100);
          });

          describe('and running of mutators was successfull while reporter.wrapUp() results in void', () => {
            beforeEach(() => {
              runMutationsPromiseResolve();
            });
            it('should resolve the stryker promise', () => strykerPromise);

            it('should have logged the amount of tests ran', () => {
              expect(log.info).to.have.been.calledWith('Initial test run succeeded. Ran %s tests.', 6);
            });
          });

          describe('and running of mutators was successfull while reporter.wrapUp() results in a promise', () => {
            let wrapUpDoneFn: Function;
            beforeEach((done) => {
              (<sinon.SinonStub>reporter.wrapUp).returns(new Promise((wrapUpDone) => wrapUpDoneFn = wrapUpDone))
              runMutationsPromiseResolve();
              setTimeout(done, 1); // give the wrapup promise some time to resolve and go to the next step (i don't know of any other way)
            });

            it('should let the reporters wrapUp any async tasks', () => {
              expect(reporter.wrapUp).to.have.been.called;
            });

            it('should not yet have resolved the stryker promise', () => {
              expect(strykerPromiseResolved).to.be.eq(false);
            });

            describe('and the reporter has wrapped up', () => {

              beforeEach(() => wrapUpDoneFn());

              it('should resolve the stryker promise', () => strykerPromise);

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
