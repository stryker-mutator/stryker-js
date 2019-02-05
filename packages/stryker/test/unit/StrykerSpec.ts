import * as sinon from 'sinon';
import { MutantResult } from 'stryker-api/report';
import { File, LogLevel } from 'stryker-api/core';
import { RunResult } from 'stryker-api/test_runner';
import { TestFramework } from 'stryker-api/test_framework';
import { factory } from '@stryker-mutator/test-helpers';
import Stryker from '../../src/Stryker';
import { Config } from 'stryker-api/config';
import { expect } from 'chai';
import InputFileResolver from '../../src/input/InputFileResolver';
import * as typedInject from 'typed-inject';
import MutatorFacade, * as mutatorFacade from '../../src/MutatorFacade';
import MutantRunResultMatcher, * as mutantRunResultMatcher from '../../src/MutantTestMatcher';
import InitialTestExecutor from '../../src/process/InitialTestExecutor';
import MutationTestExecutor, * as mutationTestExecutor from '../../src/process/MutationTestExecutor';
import ScoreResultCalculator, * as scoreResultCalculatorModule from '../../src/ScoreResultCalculator';
import { TempFolder } from '../../src/utils/TempFolder';
import currentLogMock from '../helpers/logMock';
import { mock, Mock, testFramework, runResult, testableMutant, mutantResult } from '../helpers/producers';
import BroadcastReporter from '../../src/reporters/BroadcastReporter';
import TestableMutant from '../../src/TestableMutant';
import InputFileCollection from '../../src/input/InputFileCollection';
import LogConfigurator from '../../src/logging/LogConfigurator';
import LoggingClientContext from '../../src/logging/LoggingClientContext';
import { commonTokens } from 'stryker-api/plugin';
import { TranspilerFacade } from '../../src/transpiler/TranspilerFacade';
import * as di from '../../src/di';
import Timer from '../../src/utils/Timer';

const LOGGING_CONTEXT: LoggingClientContext = Object.freeze({
  level: LogLevel.Debug,
  port: 4200
});

describe(Stryker.name, () => {
  let sut: Stryker;
  let testFrameworkMock: TestFramework;
  let inputFileResolverMock: Mock<InputFileResolver>;
  let initialTestExecutorMock: Mock<InitialTestExecutor>;
  let mutationTestExecutorMock: Mock<MutationTestExecutor>;
  let mutantRunResultMatcherMock: Mock<MutantRunResultMatcher>;
  let mutatorMock: Mock<MutatorFacade>;
  let strykerConfig: Config;
  let reporterMock: Mock<BroadcastReporter>;
  let tempFolderMock: Mock<TempFolder>;
  let scoreResultCalculator: ScoreResultCalculator;
  let configureMainProcessStub: sinon.SinonStub;
  let configureLoggingServerStub: sinon.SinonStub;
  let shutdownLoggingStub: sinon.SinonStub;
  let injectorMock: sinon.SinonStubbedInstance<typedInject.Injector>;
  let timerMock: sinon.SinonStubbedInstance<Timer>;

  beforeEach(() => {
    strykerConfig = factory.config();
    reporterMock = mock(BroadcastReporter);
    injectorMock = factory.injector();
    mutantRunResultMatcherMock = mock(MutantRunResultMatcher);
    configEditorApplierMock = mock(ConfigEditorApplier);
    mutatorMock = mock(MutatorFacade);
    configureMainProcessStub = sinon.stub(LogConfigurator, 'configureMainProcess');
    configureLoggingServerStub = sinon.stub(LogConfigurator, 'configureLoggingServer');
    shutdownLoggingStub = sinon.stub(LogConfigurator, 'shutdown');
    configureLoggingServerStub.resolves(LOGGING_CONTEXT);
    inputFileResolverMock = mock(InputFileResolver);
    testFrameworkMock = testFramework();
    initialTestExecutorMock = mock(InitialTestExecutor);
    mutationTestExecutorMock = mock(MutationTestExecutor);
    timerMock = sinon.createStubInstance(Timer);
    tempFolderMock = mock(TempFolder as any);
    tempFolderMock.clean.resolves();
    scoreResultCalculator = new ScoreResultCalculator();
    sinon.stub(di, 'buildMainInjector').returns(injectorMock);
    sinon.stub(mutationTestExecutor, 'default').returns(mutationTestExecutorMock);
    sinon.stub(mutatorFacade, 'default').returns(mutatorMock);
    sinon.stub(mutantRunResultMatcher, 'default').returns(mutantRunResultMatcherMock);
    sinon.stub(TempFolder, 'instance').returns(tempFolderMock);
    sinon.stub(scoreResultCalculator, 'determineExitCode').returns(sinon.stub());
    sinon.stub(scoreResultCalculatorModule, 'default').returns(scoreResultCalculator);
    injectorMock.injectClass
      .withArgs(BroadcastReporter).returns(reporterMock)
      .withArgs(InitialTestExecutor).returns(initialTestExecutorMock)
      .withArgs(InputFileResolver).returns(inputFileResolverMock);
    injectorMock.resolve
      .withArgs(commonTokens.config).returns(strykerConfig)
      .withArgs(di.coreTokens.timer).returns(timerMock)
      .withArgs(di.coreTokens.reporter).returns(reporterMock)
      .withArgs(di.coreTokens.testFramework).returns(testFrameworkMock);
  });

  describe('when constructed', () => {
    beforeEach(() => {
      strykerConfig.plugins = ['plugin1'];
      sut = new Stryker({});
    });

    it('should configure logging for master', () => {
      expect(configureMainProcessStub).calledTwice;
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

      it('should configure the logging server', async () => {
        sut = new Stryker({});
        await sut.runMutationTest();
        expect(configureLoggingServerStub).calledWith(strykerConfig.logLevel, strykerConfig.fileLogLevel);
      });

      it('should report mutant score', async () => {
        sut = new Stryker({});
        await sut.runMutationTest();
        expect(reporterMock.onScoreCalculated).called;
      });

      it('should determine the exit code', async () => {
        sut = new Stryker({});
        await sut.runMutationTest();
        expect(scoreResultCalculator.determineExitCode).called;
      });

      it('should create the InputFileResolver', async () => {
        sut = new Stryker({});
        await sut.runMutationTest();
        expect(inputFileResolverMock.resolve).called;
      });

      it('should create the InitialTestExecutor', async () => {
        sut = new Stryker({});
        await sut.runMutationTest();
        expect(injectorMock.injectClass).calledWith(InitialTestExecutor);
        expect(initialTestExecutorMock.run).called;
      });

      it('should create the mutator', async () => {
        sut = new Stryker({});
        await sut.runMutationTest();
        expect(mutatorFacade.default).calledWithNew;
        expect(mutatorFacade.default).calledWith(strykerConfig);
        expect(mutatorMock.mutate).calledWith(inputFiles.filesToMutate);
      });

      it('should create the mutation test executor', async () => {
        sut = new Stryker({});
        await sut.runMutationTest();
        expect(mutationTestExecutor.default).calledWithNew;
        expect(mutationTestExecutor.default).calledWith(strykerConfig, inputFiles.files, testFrameworkMock, reporterMock, undefined, LOGGING_CONTEXT);
        expect(mutationTestExecutorMock.run).calledWith(mutants);
      });

      it('should log the number of mutants generated', async () => {
        sut = new Stryker({});
        await sut.runMutationTest();
        expect(currentLogMock().info).to.have.been.calledWith('3 Mutant(s) generated');
      });

      it('should clean the stryker temp folder', async () => {
        sut = new Stryker({});
        await sut.runMutationTest();
        expect(tempFolderMock.clean).called;
      });

      it('should let the reporters wrapUp any async tasks', async () => {
        sut = new Stryker({});
        await sut.runMutationTest();
        expect(reporterMock.wrapUp).to.have.been.called;
      });

      it('should shutdown the log4js server', async () => {
        sut = new Stryker({});
        await sut.runMutationTest();
        expect(shutdownLoggingStub).called;
      });

      it('should create the transpiler with produceSourceMaps = true when coverage analysis is enabled', async () => {
        strykerConfig.coverageAnalysis = 'all';
        sut = new Stryker({});
        await sut.runMutationTest();
        expect(injectorMock.provideValue).calledWith(commonTokens.produceSourceMaps, true);
        expect(injectorMock.provideClass).calledWith(di.coreTokens.transpiler, TranspilerFacade);
      });

      it('should create the transpiler with produceSourceMaps = false when coverage analysis is "off"', async () => {
        strykerConfig.coverageAnalysis = 'off';
        sut = new Stryker({});
        await sut.runMutationTest();
        expect(injectorMock.provideValue).calledWith(commonTokens.produceSourceMaps, false);
        expect(injectorMock.provideClass).calledWith(di.coreTokens.transpiler, TranspilerFacade);
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
