import Stryker from '../../src/Stryker';
import { InputFile } from 'stryker-api/core';
import { Reporter, MutantResult } from 'stryker-api/report';
import { Config, ConfigWriterFactory, ConfigWriter } from 'stryker-api/config';
import { RunResult, RunStatus, TestStatus } from 'stryker-api/test_runner';
import { TestFramework } from 'stryker-api/test_framework';
import { expect } from 'chai';
import * as sinon from 'sinon';
import InputFileResolver, * as inputFileResolver from '../../src/InputFileResolver';
import ConfigReader, * as configReader from '../../src/ConfigReader';
import TestFrameworkOrchestrator, * as testFrameworkOrchestrator from '../../src/TestFrameworkOrchestrator';
import SandboxCoordinator, * as sandboxCoordinator from '../../src/SandboxCoordinator';
import ReporterOrchestrator, * as reporterOrchestrator from '../../src/ReporterOrchestrator';
import MutatorOrchestrator, * as mutatorOrchestrator from '../../src/MutatorOrchestrator';
import MutantRunResultMatcher, * as mutantRunResultMatcher from '../../src/MutantTestMatcher';
import ConfigValidator, * as configValidator from '../../src/ConfigValidator';
import ScoreResultCalculator from '../../src/ScoreResultCalculator';
import PluginLoader, * as pluginLoader from '../../src/PluginLoader';
import StrykerTempFolder from '../../src/utils/StrykerTempFolder';
import log from '../helpers/log4jsMock';
import { reporterStub, mock, Mock, testFramework as testFrameworkMock } from '../helpers/producers';

class FakeConfigWriter implements ConfigWriter {
  constructor() { }
  write(config: Config) {
    config.testRunner = 'fakeTestRunner';
  }
}

describe('Stryker', function () {
  let sut: Stryker;
  let sandbox: sinon.SinonSandbox;
  let testFramework: TestFramework;
  let inputFileResolverMock: Mock<InputFileResolver>;
  let testFrameworkOrchestratorMock: Mock<TestFrameworkOrchestrator>;
  let configValidatorMock: Mock<ConfigValidator>;
  let sandboxCoordinatorMock: Mock<SandboxCoordinator>;
  let configReaderMock: Mock<ConfigReader>; 
  let pluginLoaderMock: Mock<PluginLoader>;
  let inputFiles: InputFile[];
  let determineExitCodeStub: sinon.SinonStub;
  let resolveInitialTestRun: (runResult: RunResult) => void;
  let config: any;
  let mutants: any[];
  let reporter: Reporter;
  
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    config = {};
    reporter = reporterStub();
    configValidatorMock = mock(ConfigValidator);
    configReaderMock = mock(ConfigReader);
    configReaderMock.readConfig.returns(config);
    pluginLoaderMock = mock(PluginLoader);
    const reporterOrchestratorMock = mock(ReporterOrchestrator);
    const mutantRunResultMatcherMock = mock(MutantRunResultMatcher);
    const mutatorOrchestratorMock = mock(MutatorOrchestrator);
    reporterOrchestratorMock.createBroadcastReporter.returns(reporter);
    mutants = [];
    mutatorOrchestratorMock.generateMutants.returns(mutants);
    testFramework = testFrameworkMock();
    testFrameworkOrchestratorMock = mock(TestFrameworkOrchestrator);
    testFrameworkOrchestratorMock.determineTestFramework.returns(testFramework);
    sandbox.stub(configValidator, 'default').returns(configValidatorMock);
    sandbox.stub(testFrameworkOrchestrator, 'default').returns(testFrameworkOrchestratorMock);
    sandbox.stub(reporterOrchestrator, 'default').returns(reporterOrchestratorMock);
    sandbox.stub(mutatorOrchestrator, 'default').returns(mutatorOrchestratorMock);
    sandbox.stub(mutantRunResultMatcher, 'default').returns(mutantRunResultMatcherMock);
    sandbox.stub(configReader, 'default').returns(configReaderMock);
    sandbox.stub(pluginLoader, 'default').returns(pluginLoaderMock);
    sandbox.stub(StrykerTempFolder, 'clean').resolves();
    determineExitCodeStub = sandbox.stub(ScoreResultCalculator, 'determineExitCode');
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

  describe('when constructed', () => {
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

    it('should determine the testFramework', () => {
      expect(testFrameworkOrchestrator.default).to.have.been.calledWithNew;
      expect(testFrameworkOrchestrator.default).to.have.been.calledWith(config);
      expect(testFrameworkOrchestratorMock.determineTestFramework).to.have.been.called;
    });

    it('should validate the config', () => {
      expect(configValidator.default).calledWithNew;
      expect(configValidator.default).calledWith(config, testFramework);
      expect(configValidatorMock.validate).called;
    });
  });

  describe('runMutationTest()', () => {

    describe('when input file globbing results in a rejection', () => {
      beforeEach(() => {
        inputFileResolverMock = {
          resolve: sandbox.stub().rejects('a rejection')
        };
        sandbox.stub(inputFileResolver, 'default').returns(inputFileResolverMock);
        sut = new Stryker({});
      });

      actAndShouldResultInARejection();
    });

    describe('with correct input file globbing', () => {
      beforeEach(() => {
        inputFiles = [{ path: 'someFile', mutated: true, included: true }];
        inputFileResolverMock = {
          resolve: sandbox.stub().returns(Promise.resolve(inputFiles))
        };
        sandboxCoordinatorMock = {
          initialRun: sandbox.stub(),
          runMutants: sandbox.stub()
        };
        sandbox.stub(sandboxCoordinator, 'default').returns(sandboxCoordinatorMock);
        sandbox.stub(inputFileResolver, 'default').returns(inputFileResolverMock);
        sut = new Stryker({ mutate: ['mutateFile'], files: ['allFiles'] });
      });

      describe('when initialRun() resulted in a rejection', () => {

        beforeEach(() => {
          sandboxCoordinatorMock.initialRun.rejects('a rejection');
        });

        actAndShouldResultInARejection();
      });

      describe('when initial test run completes', () => {
        let runMutantsPromiseResolve: (mutantResults: MutantResult[]) => any;
        let strykerPromise: Promise<any>;

        beforeEach(() => {
          sandboxCoordinatorMock.initialRun.returns(new Promise(res => resolveInitialTestRun = res));
          sandboxCoordinatorMock.runMutants.returns(new Promise(res => runMutantsPromiseResolve = res));
        });

        describe('but contains an error and failed tests', () => {
          beforeEach((done) => {
            resolveInitialTestRun({
              tests: [{ status: TestStatus.Failed, name: 'should fail', timeSpentMs: 5 }],
              status: RunStatus.Error,
              errorMessages: ['An error!']
            });
            strykerPromise = sut.runMutationTest();
            strykerPromise.then(() => done(), () => done());
          });

          it('should create the testRunnerOrchestrator', () => {
            expect(sandboxCoordinator.default).to.have.been.calledWithNew;
            expect(sandboxCoordinator.default).to.have.been.calledWith(config, inputFiles, testFramework, reporter);
          });

          it('should have logged the errors', () => {
            expect(log.error).to.have.been.calledWith('One or more tests resulted in an error in the initial test run:\n\tAn error!');
          });

          actAndShouldResultInARejection();
        });

        describe('without errors or failed tests', () => {
          let strykerPromiseResolved: boolean;
          beforeEach(() => {
            resolveInitialTestRun({
              status: RunStatus.Complete, tests: [
                { status: TestStatus.Success, name: 'should succeed', timeSpentMs: 5 },
                { status: TestStatus.Success, name: 'should succeed as well', timeSpentMs: 5 }]
            });
            strykerPromiseResolved = false;
          });

          it('should determine the testFramework', () => {
            expect(testFrameworkOrchestrator.default).to.have.been.calledWithNew;
            expect(testFrameworkOrchestrator.default).to.have.been.calledWith(config);
            expect(testFrameworkOrchestratorMock.determineTestFramework).to.have.been.called;
          });

          let beforeEachRunMutationTest = () => {
            beforeEach(() => {
              strykerPromise = sut.runMutationTest().then(() => strykerPromiseResolved = true);
            });
          };

          describe('but the mutator does not create any mutants', () => {

            beforeEachRunMutationTest();

            // wait for Stryker to finish
            beforeEach(() => strykerPromise);

            it('should log to have quit early', () => {
              expect(log.info).to.have.been.calledWith('It\'s a mutant-free world, nothing to test.');
            });

            it('should not have ran mutations', () => {
              expect(sandboxCoordinatorMock.runMutants).not.to.have.been.called;
            });
          });

          describe('and the mutator creates mutants', () => {
            beforeEach(() => {
              mutants.push({ a: 'mutant' });
            });
            beforeEachRunMutationTest();
            it('should not directly resolve the stryker promise', (done) => {
              setTimeout(() => {
                expect(strykerPromiseResolved).to.be.eq(false);
                done();
              }, 100);
            });

            describe('and running of mutants was successful while reporter.wrapUp() results in void', () => {
              beforeEach(() => {
                runMutantsPromiseResolve([]);
                return strykerPromise;
              });
              it('should resolve the stryker promise', () => strykerPromise);

              it('should have logged the amount of tests ran', () => {
                expect(log.info).to.have.been.calledWith('Initial test run succeeded. Ran %s tests in %s.', 2);
              });

              it('should report mutant score', () => {
                expect(reporter.onScoreCalculated).to.have.been.called;
              });

              it('should determine the exit code', () => {
                expect(determineExitCodeStub).called;
              });

              it('should clean the stryker temp folder', () => expect(StrykerTempFolder.clean).to.have.been.called);
            });

            describe('and running of mutants was successful while reporter.wrapUp() results in a promise', () => {
              let wrapUpDoneFn: Function;
              beforeEach((done) => {
                (<sinon.SinonStub>reporter.wrapUp).returns(new Promise((wrapUpDone) => wrapUpDoneFn = wrapUpDone));
                runMutantsPromiseResolve([]);
                setTimeout(done, 1); // give the wrap up promise some time to resolve and go to the next step (i don't know of any other way)
              });

              it('should let the reporters wrapUp any async tasks', () => {
                expect(reporter.wrapUp).to.have.been.called;
              });

              it('should not yet have resolved the stryker promise', () => {
                expect(strykerPromiseResolved).to.be.eq(false);
              });

              describe('and the reporter has wrapped up', () => {

                beforeEach(() => {
                  wrapUpDoneFn();
                  return strykerPromise;
                });

                it('should resolve the stryker promise', () => strykerPromise);

                it('should clean the stryker temp folder', () => expect(StrykerTempFolder.clean).to.have.been.called);
              });
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
