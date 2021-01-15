import sinon = require('sinon');
import { expect } from 'chai';
import { File } from '@stryker-mutator/api/core';
import { Injector } from 'typed-inject';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { Instrumenter, InstrumentResult, InstrumenterOptions } from '@stryker-mutator/instrumenter';
import { Checker } from '@stryker-mutator/api/check';

import { MutantInstrumenterExecutor } from '../../../src/process';
import InputFileCollection from '../../../src/input/input-file-collection';
import { coreTokens } from '../../../src/di';
import { createConcurrencyTokenProviderMock, createCheckerPoolMock, ConcurrencyTokenProviderMock } from '../../helpers/producers';
import { createCheckerFactory } from '../../../src/checker/checker-facade';
import { createPreprocessor, FilePreprocessor, Sandbox } from '../../../src/sandbox';
import { Pool } from '../../../src/concurrent';

describe(MutantInstrumenterExecutor.name, () => {
  let sut: MutantInstrumenterExecutor;
  let inputFiles: InputFileCollection;
  let injectorMock: sinon.SinonStubbedInstance<Injector>;
  let instrumenterMock: sinon.SinonStubbedInstance<Instrumenter>;
  let sandboxFilePreprocessorMock: sinon.SinonStubbedInstance<FilePreprocessor>;
  let instrumentResult: InstrumentResult;
  let sandboxMock: sinon.SinonStubbedInstance<Sandbox>;
  let checkerPoolMock: sinon.SinonStubbedInstance<Pool<Checker>>;
  let concurrencyTokenProviderMock: ConcurrencyTokenProviderMock;
  let mutatedFile: File;
  let originalFile: File;
  let testFile: File;

  beforeEach(() => {
    mutatedFile = new File('foo.js', 'console.log(global.activeMutant === 1? "": "bar")');
    originalFile = new File('foo.js', 'console.log("bar")');
    testFile = new File('foo.spec.js', '');
    concurrencyTokenProviderMock = createConcurrencyTokenProviderMock();
    checkerPoolMock = createCheckerPoolMock();

    instrumentResult = {
      files: [mutatedFile],
      mutants: [factory.mutant({ id: 1, replacement: 'bar' })],
    };
    sandboxMock = sinon.createStubInstance(Sandbox);
    instrumenterMock = sinon.createStubInstance(Instrumenter);
    sandboxFilePreprocessorMock = {
      preprocess: sinon.stub(),
    };
    sandboxFilePreprocessorMock.preprocess.resolves([mutatedFile, testFile]);
    inputFiles = new InputFileCollection([originalFile, testFile], [mutatedFile.name]);
    injectorMock = factory.injector();
    sut = new MutantInstrumenterExecutor(injectorMock, inputFiles, testInjector.options);
    injectorMock.injectClass.withArgs(Instrumenter).returns(instrumenterMock);
    injectorMock.injectFunction.withArgs(createPreprocessor).returns(sandboxFilePreprocessorMock);
    injectorMock.injectFunction.withArgs(Sandbox.create).returns(sandboxMock);
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
    const expectedInstrumenterOptions: InstrumenterOptions = testInjector.options.mutator;
    expect(instrumenterMock.instrument).calledOnceWithExactly([originalFile], expectedInstrumenterOptions);
  });

  it('result in the new injector', async () => {
    const result = await sut.execute();
    expect(result).eq(injectorMock);
  });

  it('should preprocess files before initializing the sandbox', async () => {
    await sut.execute();
    expect(sandboxFilePreprocessorMock.preprocess).calledWithExactly([mutatedFile, testFile]);
    expect(sandboxFilePreprocessorMock.preprocess).calledBefore(injectorMock.injectFunction);
  });

  it('should provide the mutated files to the sandbox', async () => {
    await sut.execute();
    expect(injectorMock.provideValue).calledWithExactly(coreTokens.files, [mutatedFile, testFile]);
    expect(injectorMock.provideValue.withArgs(coreTokens.files)).calledBefore(injectorMock.injectFunction);
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
    expect(checkerPoolMock.init).calledBefore(injectorMock.injectFunction.withArgs(Sandbox.create));
  });

  it('should provide mutants in the result', async () => {
    await sut.execute();
    expect(injectorMock.provideValue).calledWithExactly(coreTokens.mutants, instrumentResult.mutants);
  });

  it('should provide the sandbox in the result', async () => {
    await sut.execute();
    expect(injectorMock.provideValue).calledWithExactly(coreTokens.sandbox, sandboxMock);
  });
});
