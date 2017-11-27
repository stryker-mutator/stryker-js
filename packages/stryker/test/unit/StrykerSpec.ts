import Stryker from '../../src/Stryker';
import { File } from 'stryker-api/core';
import { MutantResult } from 'stryker-api/report';
import { Config, ConfigEditorFactory, ConfigEditor } from 'stryker-api/config';
import { RunResult } from 'stryker-api/test_runner';
import { TestFramework } from 'stryker-api/test_framework';
import { expect } from 'chai';
import InputFileResolver, * as inputFileResolver from '../../src/InputFileResolver';
import ConfigReader, * as configReader from '../../src/ConfigReader';
import TestFrameworkOrchestrator, * as testFrameworkOrchestrator from '../../src/TestFrameworkOrchestrator';
import ReporterOrchestrator, * as reporterOrchestrator from '../../src/ReporterOrchestrator';
import MutatorFacade, * as mutatorFacade from '../../src/MutatorFacade';
import MutantRunResultMatcher, * as mutantRunResultMatcher from '../../src/MutantTestMatcher';
import InitialTestExecutor, * as initialTestExecutor from '../../src/process/InitialTestExecutor';
import MutationTestExecutor, * as mutationTestExecutor from '../../src/process/MutationTestExecutor';
import ConfigValidator, * as configValidator from '../../src/ConfigValidator';
import ScoreResultCalculator, * as scoreResultCalculatorModule from '../../src/ScoreResultCalculator';
import PluginLoader, * as pluginLoader from '../../src/PluginLoader';
import { TempDir } from '../../src/utils/TempDir';
import currentLogMock from '../helpers/log4jsMock';
import { mock, Mock, testFramework as testFrameworkMock, textFile, config, runResult, testableMutant, mutantResult } from '../helpers/producers';
import BroadcastReporter from '../../src/reporters/BroadcastReporter';
import TestableMutant from '../../src/TestableMutant';
import '../helpers/globals';

class FakeConfigEditor implements ConfigEditor {
  constructor() { }
  edit(config: Config) {
    config.testRunner = 'fakeTestRunner';
  }
}

describe('Stryker', function () {
  let sut: Stryker;
  let testFramework: TestFramework;
  let inputFileResolverMock: Mock<InputFileResolver>;
  let testFrameworkOrchestratorMock: Mock<TestFrameworkOrchestrator>;
  let configValidatorMock: Mock<ConfigValidator>;
  let configReaderMock: Mock<ConfigReader>;
  let initialTestExecutorMock: Mock<InitialTestExecutor>;
  let mutationTestExecutorMock: Mock<MutationTestExecutor>;
  let mutantRunResultMatcherMock: Mock<MutantRunResultMatcher>;
  let mutatorMock: Mock<MutatorFacade>;
  let pluginLoaderMock: Mock<PluginLoader>;
  let strykerConfig: Config;
  let reporter: Mock<BroadcastReporter>;
  let tempFolderMock: Mock<TempDir>;
  let scoreResultCalculator: ScoreResultCalculator;

  beforeEach(() => {
    strykerConfig = config();
    reporter = mock(BroadcastReporter);
    configValidatorMock = mock(ConfigValidator);
    configReaderMock = mock(ConfigReader);
    configReaderMock.readConfig.returns(strykerConfig);
    pluginLoaderMock = mock(PluginLoader);
    const reporterOrchestratorMock = mock(ReporterOrchestrator);
    mutantRunResultMatcherMock = mock(MutantRunResultMatcher);
    mutatorMock = mock(MutatorFacade);
    inputFileResolverMock = mock(InputFileResolver);
    reporterOrchestratorMock.createBroadcastReporter.returns(reporter);
    testFramework = testFrameworkMock();
    initialTestExecutorMock = mock(InitialTestExecutor);
    mutationTestExecutorMock = mock(MutationTestExecutor);
    testFrameworkOrchestratorMock = mock(TestFrameworkOrchestrator);
    testFrameworkOrchestratorMock.determineTestFramework.returns(testFramework);
    sandbox.stub(mutationTestExecutor, 'default').returns(mutationTestExecutorMock);
    sandbox.stub(initialTestExecutor, 'default').returns(initialTestExecutorMock);
    sandbox.stub(configValidator, 'default').returns(configValidatorMock);
    sandbox.stub(testFrameworkOrchestrator, 'default').returns(testFrameworkOrchestratorMock);
    sandbox.stub(reporterOrchestrator, 'default').returns(reporterOrchestratorMock);
    sandbox.stub(mutatorFacade, 'default').returns(mutatorMock);
    sandbox.stub(mutantRunResultMatcher, 'default').returns(mutantRunResultMatcherMock);
    sandbox.stub(configReader, 'default').returns(configReaderMock);
    sandbox.stub(pluginLoader, 'default').returns(pluginLoaderMock);
    sandbox.stub(inputFileResolver, 'default').returns(inputFileResolverMock);
    tempFolderMock = mock(TempDir);
    sandbox.stub(TempDir, 'instance').returns(tempFolderMock);
    tempFolderMock.clean.resolves();
    scoreResultCalculator = new ScoreResultCalculator();
    sandbox.stub(scoreResultCalculator, 'determineExitCode').returns(sandbox.stub());
    sandbox.stub(scoreResultCalculatorModule, 'default').returns(scoreResultCalculator);
  });

  describe('when constructed', () => {
    beforeEach(() => {
      ConfigEditorFactory.instance().register('FakeConfigEditor', FakeConfigEditor);
      strykerConfig.plugins = ['plugin1'];
      sut = new Stryker({});
    });

    it('should use the config editor to override config', () => {
      expect(sut.config.testRunner).to.be.eq('fakeTestRunner');
    });

    it('should freeze the config', () => {
      expect(Object.isFrozen(sut.config)).to.be.eq(true);
    });

    it('should load plugins', () => {
      expect(pluginLoader.default).to.have.been.calledWith(strykerConfig.plugins);
      expect(pluginLoaderMock.load).to.have.been.calledWith();
    });

    it('should determine the testFramework', () => {
      expect(testFrameworkOrchestrator.default).to.have.been.calledWithNew;
      expect(testFrameworkOrchestrator.default).to.have.been.calledWith(strykerConfig);
      expect(testFrameworkOrchestratorMock.determineTestFramework).to.have.been.called;
    });

    it('should validate the config', () => {
      expect(configValidator.default).calledWithNew;
      expect(configValidator.default).calledWith(strykerConfig, testFramework);
      expect(configValidatorMock.validate).called;
    });
  });

  describe('runMutationTest()', () => {

    let inputFiles: File[];
    let initialRunResult: RunResult;
    let transpiledFiles: File[];
    let mutants: TestableMutant[];
    let mutantResults: MutantResult[];

    beforeEach(() => {
      mutants = [testableMutant()];
      mutantResults = [mutantResult()];
      mutantRunResultMatcherMock.matchWithMutants.returns(mutants);
      mutatorMock.mutate.returns(mutants);
      mutationTestExecutorMock.run.resolves(mutantResults);
      inputFiles = [textFile({ name: 'input.ts ' })];
      transpiledFiles = [textFile({ name: 'output.js' })];
      inputFileResolverMock.resolve.resolves(inputFiles);
      initialRunResult = runResult();
      initialTestExecutorMock.run.resolves({ runResult: initialRunResult, transpiledFiles });
      sut = new Stryker({});
    });

    it('should reject when input file globbing results in a rejection', async () => {
      const expectedError = Error('expected error');
      inputFileResolverMock.resolve.rejects(expectedError);
      await expect(sut.runMutationTest()).rejectedWith(expectedError);
    });

    it('should reject when initial test run rejects', async () => {
      const expectedError = Error('expected error');
      initialTestExecutorMock.run.rejects(expectedError);
      await expect(sut.runMutationTest()).rejectedWith(expectedError);
    });

    it('should reject when mutation tester rejects', async () => {
      const expectedError = Error('expected error');
      mutationTestExecutorMock.run.rejects(expectedError);
      await expect(sut.runMutationTest()).rejectedWith(expectedError);
    });

    it('should quit early if no tests were executed in initial test run', async () => {
      while (initialRunResult.tests.pop());
      const actualResults = await sut.runMutationTest();
      expect(mutationTestExecutorMock.run).not.called;
      expect(actualResults).lengthOf(0);
    });

    it('should log to have quit early if no mutants were generated', async () => {
      while (mutants.pop()); // clear all mutants
      await sut.runMutationTest();
      expect(currentLogMock().info).to.have.been.calledWith('It\'s a mutant-free world, nothing to test.');
      expect(mutationTestExecutorMock.run).not.called;
    });

    describe('happy flow', () => {

      beforeEach(() => {
        return sut.runMutationTest();
      });

      it('should report mutant score', () => {
        expect(reporter.onScoreCalculated).to.have.been.called;
      });

      it('should determine the exit code', () => {
        expect(scoreResultCalculator.determineExitCode).called;
      });

      it('should determine the testFramework', () => {
        expect(testFrameworkOrchestrator.default).calledWithNew;
        expect(testFrameworkOrchestrator.default).calledWith(strykerConfig);
        expect(testFrameworkOrchestratorMock.determineTestFramework).to.have.been.called;
      });

      it('should create the InputFileResolver', () => {
        expect(inputFileResolver.default).calledWithNew;
        expect(inputFileResolver.default).calledWith(strykerConfig.mutate, strykerConfig.files, reporter);
        expect(inputFileResolverMock.resolve).called;
      });

      it('should create the InitialTestRunner', () => {
        expect(initialTestExecutor.default).calledWithNew;
        expect(initialTestExecutor.default).calledWith(strykerConfig, inputFiles);
        expect(initialTestExecutorMock.run).called;
      });

      it('should create the mutant generator', () => {
        expect(mutatorFacade.default).calledWithNew;
        expect(mutatorFacade.default).calledWith(strykerConfig);
        expect(mutatorMock.mutate).calledWith(inputFiles);
      });

      it('should create the mutation test executor', () => {
        expect(mutationTestExecutor.default).calledWithNew;
        expect(mutationTestExecutor.default).calledWith(strykerConfig, inputFiles, testFramework, reporter);
        expect(mutationTestExecutorMock.run).calledWith(mutants);
      });

      it('should clean the stryker temp folder', () => {
        expect(tempFolderMock.clean).called;
      });

      it('should let the reporters wrapUp any async tasks', () => {
        expect(reporter.wrapUp).to.have.been.called;
      });
    });
  });
});