import * as sinon from 'sinon';
import { MutantResult } from 'stryker-api/report';
import { File, LogLevel } from 'stryker-api/core';
import { RunResult } from 'stryker-api/test_runner';
import { TestFramework } from 'stryker-api/test_framework';
import Stryker from '../../src/Stryker';
import { Config } from 'stryker-api/config';
import { expect } from 'chai';
import InputFileResolver, * as inputFileResolver from '../../src/input/InputFileResolver';
import ConfigReader, * as configReader from '../../src/config/ConfigReader';
import TestFrameworkOrchestrator from '../../src/TestFrameworkOrchestrator';
import * as typedInject from 'typed-inject';
import MutatorFacade, * as mutatorFacade from '../../src/MutatorFacade';
import MutantRunResultMatcher, * as mutantRunResultMatcher from '../../src/MutantTestMatcher';
import InitialTestExecutor, * as initialTestExecutor from '../../src/process/InitialTestExecutor';
import MutationTestExecutor, * as mutationTestExecutor from '../../src/process/MutationTestExecutor';
import ConfigValidator, * as configValidator from '../../src/config/ConfigValidator';
import ScoreResultCalculator, * as scoreResultCalculatorModule from '../../src/ScoreResultCalculator';
import PluginLoader, * as pluginLoader from '../../src/di/PluginLoader';
import { TempFolder } from '../../src/utils/TempFolder';
import currentLogMock from '../helpers/logMock';
import { mock, Mock, testFramework as testFrameworkMock, config, runResult, testableMutant, mutantResult } from '../helpers/producers';
import BroadcastReporter from '../../src/reporters/BroadcastReporter';
import TestableMutant from '../../src/TestableMutant';
import InputFileCollection from '../../src/input/InputFileCollection';
import LogConfigurator from '../../src/logging/LogConfigurator';
import LoggingClientContext from '../../src/logging/LoggingClientContext';
import { OptionsContext } from 'stryker-api/plugin';
import { ConfigEditorApplier } from '../../src/config/ConfigEditorApplier';

const LOGGING_CONTEXT: LoggingClientContext = Object.freeze({
  level: LogLevel.Debug,
  port: 4200
});

describe('Stryker', () => {
  let sut: Stryker;
  let testFramework: TestFramework;
  let inputFileResolverMock: Mock<InputFileResolver>;
  let testFrameworkOrchestratorMock: Mock<TestFrameworkOrchestrator>;
  let configEditorApplierMock: Mock<ConfigEditorApplier>;
  let configValidatorMock: Mock<ConfigValidator>;
  let configReaderMock: Mock<ConfigReader>;
  let initialTestExecutorMock: Mock<InitialTestExecutor>;
  let mutationTestExecutorMock: Mock<MutationTestExecutor>;
  let mutantRunResultMatcherMock: Mock<MutantRunResultMatcher>;
  let mutatorMock: Mock<MutatorFacade>;
  let pluginLoaderMock: Mock<PluginLoader>;
  let strykerConfig: Config;
  let reporter: Mock<BroadcastReporter>;
  let tempFolderMock: Mock<TempFolder>;
  let scoreResultCalculator: ScoreResultCalculator;
  let configureMainProcessStub: sinon.SinonStub;
  let configureLoggingServerStub: sinon.SinonStub;
  let shutdownLoggingStub: sinon.SinonStub;
  let injectorMock: Mock<typedInject.Injector<OptionsContext>>;

  beforeEach(() => {
    strykerConfig = config();
    reporter = mock(BroadcastReporter);
    configValidatorMock = mock(ConfigValidator);
    configReaderMock = mock(ConfigReader);
    configReaderMock.readConfig.returns(strykerConfig);
    pluginLoaderMock = mock(PluginLoader);

    injectorMock = {
      injectClass: sinon.stub(),
      injectFunction: sinon.stub(),
      provideClass: sinon.stub(),
      provideFactory: sinon.stub(),
      provideValue: sinon.stub(),
      resolve: sinon.stub()
    };
    injectorMock.provideClass.returnsThis();
    injectorMock.provideFactory.returnsThis();
    injectorMock.provideValue.returnsThis();
    mutantRunResultMatcherMock = mock(MutantRunResultMatcher);
    configEditorApplierMock = mock(ConfigEditorApplier);
    mutatorMock = mock(MutatorFacade);
    injectorMock.injectClass
      .withArgs(ConfigEditorApplier).returns(configEditorApplierMock)
      .withArgs(BroadcastReporter).returns(reporter);
    configureMainProcessStub = sinon.stub(LogConfigurator, 'configureMainProcess');
    configureLoggingServerStub = sinon.stub(LogConfigurator, 'configureLoggingServer');
    shutdownLoggingStub = sinon.stub(LogConfigurator, 'shutdown');
    configureLoggingServerStub.resolves(LOGGING_CONTEXT);
    inputFileResolverMock = mock(InputFileResolver);
    testFramework = testFrameworkMock();
    initialTestExecutorMock = mock(InitialTestExecutor);
    mutationTestExecutorMock = mock(MutationTestExecutor);
    testFrameworkOrchestratorMock = mock(TestFrameworkOrchestrator);
    testFrameworkOrchestratorMock.determineTestFramework.returns(testFramework);
    sinon.stub(mutationTestExecutor, 'default').returns(mutationTestExecutorMock);
    sinon.stub(initialTestExecutor, 'default').returns(initialTestExecutorMock);
    sinon.stub(configValidator, 'default').returns(configValidatorMock);
    sinon.stub(typedInject, 'rootInjector').value(injectorMock);
    sinon.stub(mutatorFacade, 'default').returns(mutatorMock);
    sinon.stub(mutantRunResultMatcher, 'default').returns(mutantRunResultMatcherMock);
    sinon.stub(configReader, 'default').returns(configReaderMock);
    sinon.stub(pluginLoader, 'default').returns(pluginLoaderMock);
    sinon.stub(inputFileResolver, 'default').returns(inputFileResolverMock);
    tempFolderMock = mock(TempFolder as any);
    sinon.stub(TempFolder, 'instance').returns(tempFolderMock);
    tempFolderMock.clean.resolves();
    scoreResultCalculator = new ScoreResultCalculator();
    sinon.stub(scoreResultCalculator, 'determineExitCode').returns(sinon.stub());
    sinon.stub(scoreResultCalculatorModule, 'default').returns(scoreResultCalculator);
  });

  describe('when constructed', () => {
    beforeEach(() => {
      strykerConfig.plugins = ['plugin1'];
      sut = new Stryker({});
    });

    it('should apply the config editors', () => {
      expect(configEditorApplierMock.edit).calledWith(strykerConfig);
    });

    it('should configure logging for master', () => {
      expect(configureMainProcessStub).calledThrice;
    });

    it('should freeze the config', () => {
      expect(Object.isFrozen(sut.config)).to.be.eq(true);
    });

    it('should load plugins', () => {
      expect(pluginLoader.default).to.have.been.calledWith(strykerConfig.plugins);
      expect(pluginLoaderMock.load).to.have.been.calledWith();
    });

    it('should determine the testFramework', () => {
      expect(testFrameworkOrchestratorMock.determineTestFramework).to.have.been.called;
    });

    it('should validate the config', () => {
      expect(configValidator.default).calledWithNew;
      expect(configValidator.default).calledWith(strykerConfig, testFramework);
      expect(configValidatorMock.validate).called;
    });
  });

  describe('runMutationTest()', () => {

    let inputFiles: InputFileCollection;
    let initialRunResult: RunResult;
    let transpiledFiles: File[];
    let mutants: TestableMutant[];
    let mutantResults: MutantResult[];

    beforeEach(() => {
      mutants = [
        testableMutant('file1', 'fooMutator'),
        testableMutant('file2', 'barMutator'),
        testableMutant('file3', 'bazMutator')
      ];
      mutantResults = [mutantResult()];
      mutantRunResultMatcherMock.matchWithMutants.returns(mutants);
      mutatorMock.mutate.returns(mutants);
      mutationTestExecutorMock.run.resolves(mutantResults);
      inputFiles = new InputFileCollection([new File('input.ts', '')], ['input.ts']);
      transpiledFiles = [new File('output.js', '')];
      inputFileResolverMock.resolve.resolves(inputFiles);
      initialRunResult = runResult();
      initialTestExecutorMock.run.resolves({ runResult: initialRunResult, transpiledFiles });
    });

    describe('sad flow', () => {

      beforeEach(() => {
        sut = new Stryker({});
      });

      it('should reject when logging server rejects', async () => {
        const expectedError = Error('expected error');
        configureLoggingServerStub.rejects(expectedError);
        await expect(sut.runMutationTest()).rejectedWith(expectedError);
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

      it('should quit early if no mutants were generated', async () => {
        while (mutants.pop()); // clear all mutants
        await sut.runMutationTest();
        expect(mutationTestExecutorMock.run).not.called;
      });

      it('should log the absence of mutants if no mutants were generated', async () => {
        while (mutants.pop()); // clear all mutants
        await sut.runMutationTest();
        expect(currentLogMock().info).to.have.been.calledWith('It\'s a mutant-free world, nothing to test.');
      });

      it('should log the remark to run again with logLevel trace if no tests were executed in initial test run', async () => {
        while (initialRunResult.tests.pop());
        await sut.runMutationTest();
        expect(currentLogMock().info).to.have.been.calledWith('Trouble figuring out what went wrong? Try `npx stryker run --fileLogLevel trace --logLevel debug` to get some more info.');
      });

      it('should log the remark to run again with logLevel trace if no mutants were generated', async () => {
        while (mutants.pop()); // clear all mutants
        await sut.runMutationTest();
        expect(currentLogMock().info).to.have.been.calledWith('Trouble figuring out what went wrong? Try `npx stryker run --fileLogLevel trace --logLevel debug` to get some more info.');
      });
    });

    describe('happy flow', () => {

      beforeEach(() => {
        sut = new Stryker({});
        return sut.runMutationTest();
      });

      it('should configure the logging server', () => {
        expect(configureLoggingServerStub).calledWith(strykerConfig.logLevel, strykerConfig.fileLogLevel);
      });

      it('should report mutant score', () => {
        expect(reporter.onScoreCalculated).to.have.been.called;
      });

      it('should determine the exit code', () => {
        expect(scoreResultCalculator.determineExitCode).called;
      });

      it('should determine the testFramework', () => {
        expect(testFrameworkOrchestratorMock.determineTestFramework).to.have.been.called;
      });

      it('should create the InputFileResolver', () => {
        expect(inputFileResolver.default).calledWithNew;
        expect(inputFileResolver.default).calledWith(strykerConfig.mutate, strykerConfig.files, reporter);
        expect(inputFileResolverMock.resolve).called;
      });

      it('should create the InitialTestExecutor', () => {
        expect(initialTestExecutor.default).calledWithNew;
        expect(initialTestExecutor.default).calledWith(strykerConfig, inputFiles, testFramework, sinon.match.any, LOGGING_CONTEXT);
        expect(initialTestExecutorMock.run).called;
      });

      it('should create the mutator', () => {
        expect(mutatorFacade.default).calledWithNew;
        expect(mutatorFacade.default).calledWith(strykerConfig);
        expect(mutatorMock.mutate).calledWith(inputFiles.filesToMutate);
      });

      it('should create the mutation test executor', () => {
        expect(mutationTestExecutor.default).calledWithNew;
        expect(mutationTestExecutor.default).calledWith(strykerConfig, inputFiles.files, testFramework, reporter, undefined, LOGGING_CONTEXT);
        expect(mutationTestExecutorMock.run).calledWith(mutants);
      });

      it('should log the number of mutants generated', () => {
        expect(currentLogMock().info).to.have.been.calledWith('3 Mutant(s) generated');
      });

      it('should clean the stryker temp folder', () => {
        expect(tempFolderMock.clean).called;
      });

      it('should let the reporters wrapUp any async tasks', () => {
        expect(reporter.wrapUp).to.have.been.called;
      });

      it('should shutdown the log4js server', () => {
        expect(shutdownLoggingStub).called;
      });
    });

    describe('with excluded mutants', () => {

      it('should log the number of mutants generated and excluded', async () => {
        strykerConfig.mutator = {
          excludedMutations: ['fooMutator'],
          name: 'es5'
        };
        sut = new Stryker({});
        await sut.runMutationTest();
        expect(currentLogMock().info).to.have.been.calledWith('2 Mutant(s) generated (1 Mutant(s) excluded)');
      });

      it('should log the absence of mutants and the excluded number when all mutants are excluded', async () => {
        strykerConfig.mutator = {
          excludedMutations: ['fooMutator', 'barMutator', 'bazMutator'],
          name: 'es5'
        };
        sut = new Stryker({});
        await sut.runMutationTest();
        expect(currentLogMock().info).to.have.been.calledWith('It\'s a mutant-free world, nothing to test. (3 Mutant(s) excluded)');
      });

      it('should filter out the excluded mutations', async () => {
        strykerConfig.mutator = {
          excludedMutations: ['barMutator', 'bazMutator'],
          name: 'es5'
        };
        sut = new Stryker({});
        await sut.runMutationTest();
        expect(mutantRunResultMatcher.default).calledWithNew;
        expect(mutantRunResultMatcher.default).calledWith([mutants[0]]);
      });
    });
  });
});
