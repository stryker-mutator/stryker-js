import sinon from 'sinon';
import { expect } from 'chai';
import { File } from '@stryker-mutator/api/core';
import { Injector } from 'typed-inject';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { Instrumenter, InstrumentResult, InstrumenterOptions, createInstrumenter } from '@stryker-mutator/instrumenter';
import { I } from '@stryker-mutator/util';

import { DryRunContext, MutantInstrumenterContext, MutantInstrumenterExecutor } from '../../../src/process/index.js';
import { InputFileCollection } from '../../../src/input/index.js';
import { coreTokens } from '../../../src/di/index.js';
import { createConcurrencyTokenProviderMock, createCheckerResourcePoolMock, ConcurrencyTokenProviderMock } from '../../helpers/producers.js';
import { CheckerFacade, createCheckerFactory } from '../../../src/checker/index.js';
import { createPreprocessor, FilePreprocessor, Sandbox } from '../../../src/sandbox/index.js';
import { Pool } from '../../../src/concurrent/index.js';

describe(MutantInstrumenterExecutor.name, () => {
  let sut: MutantInstrumenterExecutor;
  let inputFiles: InputFileCollection;
  let injectorMock: sinon.SinonStubbedInstance<Injector<DryRunContext>>;
  let instrumenterMock: sinon.SinonStubbedInstance<Instrumenter>;
  let sandboxFilePreprocessorMock: sinon.SinonStubbedInstance<FilePreprocessor>;
  let instrumentResult: InstrumentResult;
  let sandboxMock: sinon.SinonStubbedInstance<Sandbox>;
  let checkerPoolMock: sinon.SinonStubbedInstance<I<Pool<CheckerFacade>>>;
  let concurrencyTokenProviderMock: ConcurrencyTokenProviderMock;
  let mutatedFile: File;
  let originalFile: File;
  let testFile: File;

  beforeEach(() => {
    mutatedFile = new File('foo.js', 'console.log(global.activeMutant === 1? "": "bar")');
    originalFile = new File('foo.js', 'console.log("bar")');
    testFile = new File('foo.spec.js', '');
    concurrencyTokenProviderMock = createConcurrencyTokenProviderMock();
    checkerPoolMock = createCheckerResourcePoolMock();

    instrumentResult = {
      files: [mutatedFile],
      mutants: [factory.mutant({ id: '1', replacement: 'bar' })],
    };
    sandboxMock = sinon.createStubInstance(Sandbox);
    instrumenterMock = sinon.createStubInstance(Instrumenter);
    sandboxFilePreprocessorMock = {
      preprocess: sinon.stub(),
    };
    sandboxFilePreprocessorMock.preprocess.resolves([mutatedFile, testFile]);
    inputFiles = new InputFileCollection([originalFile, testFile], [mutatedFile.name], []);
    injectorMock = factory.injector() as unknown as sinon.SinonStubbedInstance<Injector<DryRunContext>>;
    sut = new MutantInstrumenterExecutor(injectorMock as Injector<MutantInstrumenterContext>, inputFiles, testInjector.options);
    injectorMock.injectFunction.withArgs(createInstrumenter).returns(instrumenterMock);
    injectorMock.injectFunction.withArgs(createPreprocessor).returns(sandboxFilePreprocessorMock);
    injectorMock.resolve.withArgs(coreTokens.sandbox).returns(sandboxMock);
    injectorMock.resolve
      .withArgs(coreTokens.concurrencyTokenProvider)
      .returns(concurrencyTokenProviderMock)
      .withArgs(coreTokens.checkerPool)
      .returns(checkerPoolMock as I<Pool<CheckerFacade>>);
    instrumenterMock.instrument.resolves(instrumentResult);
  });

  it('should instrument the given files', async () => {
    testInjector.options.mutator.plugins = ['functionSent'];
    testInjector.options.mutator.excludedMutations = ['fooMutator'];
    await sut.execute();
    const expectedInstrumenterOptions: InstrumenterOptions = { ...testInjector.options.mutator, mutationRanges: [] };
    expect(instrumenterMock.instrument).calledOnceWithExactly([originalFile], expectedInstrumenterOptions);
  });

  it('result in the new injector', async () => {
    const result = await sut.execute();
    expect(result).eq(injectorMock);
  });

  it('should preprocess files before initializing the sandbox', async () => {
    await sut.execute();
    expect(sandboxFilePreprocessorMock.preprocess).calledWithExactly([mutatedFile, testFile]);
    expect(sandboxFilePreprocessorMock.preprocess).calledBefore(sandboxMock.init);
  });

  it('should provide the mutated files to the sandbox', async () => {
    await sut.execute();
    expect(injectorMock.provideValue).calledWithExactly(coreTokens.files, [mutatedFile, testFile]);
    expect(injectorMock.provideValue.withArgs(coreTokens.files, sinon.match.any)).calledBefore(sandboxMock.init);
  });

  it('should provide checkerToken$ to the checker pool', async () => {
    concurrencyTokenProviderMock.checkerToken$.next(0);
    concurrencyTokenProviderMock.checkerToken$.next(1);
    await sut.execute();
    expect(injectorMock.provideValue).calledWith(coreTokens.checkerConcurrencyTokens, concurrencyTokenProviderMock.checkerToken$);
  });

  it('should provide the checker factory to the checker pool', async () => {
    await sut.execute();
    expect(injectorMock.provideFactory).calledWith(coreTokens.checkerFactory, createCheckerFactory);
  });

  it('should initialize the CheckerPool before creating the sandbox', async () => {
    // This is important for in-place mutation. We need to initialize the typescript checker(s) before we write mutated files to disk.
    await sut.execute();
    expect(checkerPoolMock.init).calledBefore(injectorMock.provideClass.withArgs(coreTokens.sandbox, Sandbox));
  });

  it('should provide mutants in the result', async () => {
    await sut.execute();
    expect(injectorMock.provideValue).calledWithExactly(coreTokens.mutants, instrumentResult.mutants);
  });

  it('should provide the sandbox in the result', async () => {
    await sut.execute();
    expect(injectorMock.provideClass).calledWithExactly(coreTokens.sandbox, Sandbox);
  });

  it('should initialize the sandbox', async () => {
    await sut.execute();
    expect(sandboxMock.init).calledOnce;
  });
});
