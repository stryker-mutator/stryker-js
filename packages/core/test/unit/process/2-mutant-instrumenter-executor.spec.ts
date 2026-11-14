import sinon from 'sinon';
import { expect } from 'chai';
import { Injector } from 'typed-inject';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import {
  Instrumenter,
  InstrumentResult,
  InstrumenterOptions,
  createInstrumenter,
} from '@stryker-mutator/instrumenter';
import { I } from '@stryker-mutator/util';
import { FileDescriptions } from '@stryker-mutator/api/core';
import { DryRunStatus } from '@stryker-mutator/api/test-runner';
import { PluginKind } from '@stryker-mutator/api/plugin';

import {
  DryRunContext,
  MutantInstrumenterExecutor,
  NoMutantsToTestExecutor,
} from '../../../src/process/index.js';
import { Project } from '../../../src/fs/index.js';
import { PluginCreator, coreTokens } from '../../../src/di/index.js';
import {
  createConcurrencyTokenProviderMock,
  createCheckerPoolMock,
  ConcurrencyTokenProviderMock,
} from '../../helpers/producers.js';
import {
  CheckerFacade,
  createCheckerFactory,
} from '../../../src/checker/index.js';
import {
  createPreprocessor,
  FilePreprocessor,
  Sandbox,
} from '../../../src/sandbox/index.js';
import { Pool } from '../../../src/concurrent/index.js';
import { FileSystemTestDouble } from '../../helpers/file-system-test-double.js';

describe(MutantInstrumenterExecutor.name, () => {
  let sut: MutantInstrumenterExecutor;
  let project: Project;
  let injectorMock: sinon.SinonStubbedInstance<Injector<DryRunContext>>;
  let instrumenterMock: sinon.SinonStubbedInstance<Instrumenter>;
  let sandboxFilePreprocessorMock: sinon.SinonStubbedInstance<FilePreprocessor>;
  let instrumentResult: InstrumentResult;
  let sandboxMock: sinon.SinonStubbedInstance<Sandbox>;
  let checkerPoolMock: sinon.SinonStubbedInstance<I<Pool<I<CheckerFacade>>>>;
  let concurrencyTokenProviderMock: ConcurrencyTokenProviderMock;
  let pluginCreatorMock: sinon.SinonStubbedInstance<PluginCreator>;

  beforeEach(() => {
    const fsTestDouble = new FileSystemTestDouble({
      'foo.js': 'console.log("bar")',
      'foo.spec.js': '',
    });
    const fileDescriptions: FileDescriptions = {
      'foo.js': { mutate: true },
      'foo.spec.js': { mutate: false },
    };
    project = new Project(fsTestDouble, fileDescriptions);
    concurrencyTokenProviderMock = createConcurrencyTokenProviderMock();
    checkerPoolMock = createCheckerPoolMock();

    instrumentResult = {
      files: [
        {
          name: 'foo.js',
          content: 'console.log(global.activeMutant === 1? "": "bar")',
          mutate: true,
        },
      ],
      mutants: [factory.mutant({ id: '1', replacement: 'bar' })],
    };
    sandboxMock = sinon.createStubInstance(Sandbox);
    instrumenterMock = sinon.createStubInstance(Instrumenter);
    sandboxFilePreprocessorMock = {
      preprocess: sinon.stub(),
    };
    sandboxFilePreprocessorMock.preprocess.resolves();
    injectorMock = factory.injector() as unknown as sinon.SinonStubbedInstance<
      Injector<DryRunContext>
    >;
    pluginCreatorMock = sinon.createStubInstance(PluginCreator);
    sut = new MutantInstrumenterExecutor(
      injectorMock,
      project,
      testInjector.options,
      pluginCreatorMock,
      testInjector.logger,
    );
    injectorMock.injectFunction
      .withArgs(createInstrumenter)
      .returns(instrumenterMock);
    injectorMock.injectFunction
      .withArgs(createPreprocessor)
      .returns(sandboxFilePreprocessorMock);
    injectorMock.resolve.withArgs(coreTokens.sandbox).returns(sandboxMock);
    injectorMock.resolve
      .withArgs(coreTokens.concurrencyTokenProvider)
      .returns(concurrencyTokenProviderMock)
      .withArgs(coreTokens.checkerPool)
      .returns(checkerPoolMock);
    instrumenterMock.instrument.resolves(instrumentResult);
  });

  it('should instrument the given files', async () => {
    testInjector.options.mutator.plugins = ['functionSent'];
    testInjector.options.mutator.excludedMutations = ['fooMutator'];
    await sut.execute();
    const expectedInstrumenterOptions: InstrumenterOptions = {
      ...testInjector.options.mutator,
      ignorers: [],
    };
    sinon.assert.calledOnceWithExactly(
      instrumenterMock.instrument,
      [{ name: 'foo.js', content: 'console.log("bar")', mutate: true }],
      expectedInstrumenterOptions,
    );
  });

  it('should instrument the given files with single ignorer', async () => {
    testInjector.options.mutator.plugins = ['functionSent'];
    testInjector.options.mutator.excludedMutations = ['notIgnorer'];
    testInjector.options.ignorers = ['notIgnorer'];
    const notIgnorer = { shouldIgnore: () => undefined };
    pluginCreatorMock.create.returns(notIgnorer);
    await sut.execute();
    const expectedInstrumenterOptions: InstrumenterOptions = {
      ...testInjector.options.mutator,
      ignorers: [notIgnorer],
    };
    sinon.assert.calledOnceWithExactly(
      instrumenterMock.instrument,
      [{ name: 'foo.js', content: 'console.log("bar")', mutate: true }],
      expectedInstrumenterOptions,
    );
    sinon.assert.calledOnceWithExactly(
      pluginCreatorMock.create,
      PluginKind.Ignore,
      'notIgnorer',
    );
  });

  it('result in the new injector', async () => {
    const result = await sut.execute();
    expect(result).eq(injectorMock);
  });

  it('should preprocess files before initializing the sandbox', async () => {
    await sut.execute();
    expect(sandboxFilePreprocessorMock.preprocess).calledWithExactly(project);
    expect(sandboxFilePreprocessorMock.preprocess).calledBefore(
      sandboxMock.init,
    );
  });

  it('should provide checkerToken$ to the checker pool', async () => {
    concurrencyTokenProviderMock.checkerToken$.next(0);
    concurrencyTokenProviderMock.checkerToken$.next(1);
    await sut.execute();
    expect(injectorMock.provideValue).calledWith(
      coreTokens.checkerConcurrencyTokens,
      concurrencyTokenProviderMock.checkerToken$,
    );
  });

  it('should provide the checker factory to the checker pool', async () => {
    await sut.execute();
    expect(injectorMock.provideFactory).calledWith(
      coreTokens.checkerFactory,
      createCheckerFactory,
    );
  });

  it('should initialize the CheckerPool before creating the sandbox', async () => {
    // This is important for in-place mutation. We need to initialize the typescript checker(s) before we write mutated files to disk.
    await sut.execute();
    expect(checkerPoolMock.init).calledBefore(
      injectorMock.provideClass.withArgs(coreTokens.sandbox, Sandbox),
    );
  });

  it('should provide mutants in the result', async () => {
    await sut.execute();
    expect(injectorMock.provideValue).calledWithExactly(
      coreTokens.mutants,
      instrumentResult.mutants,
    );
  });

  it('should provide the sandbox in the result', async () => {
    await sut.execute();
    expect(injectorMock.provideClass).calledWithExactly(
      coreTokens.sandbox,
      Sandbox,
    );
  });

  it('should initialize the sandbox', async () => {
    await sut.execute();
    expect(sandboxMock.init).calledOnce;
  });

  describe('without mutants to test', () => {
    let noMutantsToTestExecutorMock: sinon.SinonStubbedInstance<NoMutantsToTestExecutor>;
    let mutantResults: ReturnType<typeof factory.mutantResult>[];

    beforeEach(() => {
      mutantResults = [factory.mutantResult({ status: 'Ignored' })];
      noMutantsToTestExecutorMock = sinon.createStubInstance(
        NoMutantsToTestExecutor,
      );
      noMutantsToTestExecutorMock.execute.resolves(mutantResults);
      injectorMock.injectClass
        .withArgs(NoMutantsToTestExecutor)
        .returns(noMutantsToTestExecutorMock);
    });

    it('should report the results without testing when no mutants were found', async () => {
      instrumentResult.mutants = [];
      const result = await sut.execute();
      expect(result).eq(mutantResults);
      sinon.assert.calledOnce(noMutantsToTestExecutorMock.execute);
    });

    it('should report the results without testing when all mutants are ignored', async () => {
      instrumentResult.mutants = [
        factory.mutant({ id: '1', status: 'Ignored' }),
        factory.mutant({ id: '2', status: 'Ignored' }),
      ];
      const result = await sut.execute();
      expect(result).eq(mutantResults);
      sinon.assert.calledWithExactly(
        injectorMock.provideValue,
        coreTokens.mutants,
        instrumentResult.mutants,
      );
    });

    it('should provide an empty dry run result to report without coverage', async () => {
      instrumentResult.mutants = [];
      await sut.execute();
      sinon.assert.calledWithExactly(
        injectorMock.provideValue,
        coreTokens.dryRunResult,
        { status: DryRunStatus.Complete, tests: [] },
      );
    });

    it('should log that the run is skipped', async () => {
      instrumentResult.mutants = [
        factory.mutant({ id: '1', status: 'Ignored' }),
      ];
      await sut.execute();
      sinon.assert.calledWithExactly(
        testInjector.logger.info,
        'No mutants to test. Skipping the checkers, sandbox and initial test run.',
      );
    });

    it('should not start the checkers, preprocess or create the sandbox', async () => {
      instrumentResult.mutants = [];
      await sut.execute();
      sinon.assert.notCalled(checkerPoolMock.init);
      sinon.assert.notCalled(sandboxFilePreprocessorMock.preprocess);
      sinon.assert.neverCalledWith(
        injectorMock.provideClass,
        coreTokens.sandbox,
        Sandbox,
      );
      sinon.assert.notCalled(sandboxMock.init);
    });

    it('should test as usual when one mutant is not ignored', async () => {
      instrumentResult.mutants = [
        factory.mutant({ id: '1', status: 'Ignored' }),
        factory.mutant({ id: '2' }),
      ];
      const result = await sut.execute();
      expect(result).eq(injectorMock);
      sinon.assert.notCalled(noMutantsToTestExecutorMock.execute);
      sinon.assert.calledOnce(sandboxMock.init);
    });

    it('should still do the dry run when "dryRunOnly" is enabled', async () => {
      testInjector.options.dryRunOnly = true;
      instrumentResult.mutants = [];
      const result = await sut.execute();
      expect(result).eq(injectorMock);
      sinon.assert.notCalled(noMutantsToTestExecutorMock.execute);
      sinon.assert.calledOnce(checkerPoolMock.init);
      sinon.assert.calledOnce(sandboxMock.init);
    });
  });
});
