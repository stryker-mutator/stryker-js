import sinon = require('sinon');
import { expect } from 'chai';
import { File } from '@stryker-mutator/api/core';
import { Injector } from 'typed-inject';
import { factory } from '@stryker-mutator/test-helpers';
import { Instrumenter, InstrumentResult } from '@stryker-mutator/instrumenter';
import { Checker } from '@stryker-mutator/api/check';

import { MutantInstrumenterExecutor } from '../../../src/process';
import InputFileCollection from '../../../src/input/InputFileCollection';
import { coreTokens } from '../../../src/di';
import { createConcurrencyTokenProviderMock, createCheckerPoolMock, PoolMock, ConcurrencyTokenProviderMock } from '../../helpers/producers';
import { createCheckerFactory } from '../../../src/checker/CheckerFacade';
import { SandboxTSConfigRewriter, Sandbox } from '../../../src/sandbox';

describe(MutantInstrumenterExecutor.name, () => {
  let sut: MutantInstrumenterExecutor;
  let inputFiles: InputFileCollection;
  let injectorMock: sinon.SinonStubbedInstance<Injector>;
  let instrumenterMock: sinon.SinonStubbedInstance<Instrumenter>;
  let sandboxTSConfigRewriterMock: sinon.SinonStubbedInstance<SandboxTSConfigRewriter>;
  let instrumentResult: InstrumentResult;
  let sandboxMock: sinon.SinonStubbedInstance<Sandbox>;
  let checkerPoolMock: PoolMock<Checker>;
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
    sandboxTSConfigRewriterMock = sinon.createStubInstance(SandboxTSConfigRewriter);
    sandboxTSConfigRewriterMock.rewrite.resolves([mutatedFile, testFile]);
    inputFiles = new InputFileCollection([originalFile, testFile], [mutatedFile.name]);
    injectorMock = factory.injector();
    sut = new MutantInstrumenterExecutor(injectorMock, inputFiles);
    injectorMock.injectClass.withArgs(Instrumenter).returns(instrumenterMock);
    injectorMock.injectClass.withArgs(SandboxTSConfigRewriter).returns(sandboxTSConfigRewriterMock);
    injectorMock.injectFunction.withArgs(Sandbox.create).returns(sandboxMock);
    injectorMock.resolve
      .withArgs(coreTokens.concurrencyTokenProvider)
      .returns(concurrencyTokenProviderMock)
      .withArgs(coreTokens.checkerPool)
      .returns(checkerPoolMock);
    instrumenterMock.instrument.resolves(instrumentResult);
  });

  it('should instrument the given files', async () => {
    await sut.execute();
    expect(instrumenterMock.instrument).calledOnceWithExactly([originalFile]);
  });

  it('result in the new injector', async () => {
    const result = await sut.execute();
    expect(result).eq(injectorMock);
  });

  it('should rewrite tsconfig files before initializing the sandbox', async () => {
    await sut.execute();
    expect(sandboxTSConfigRewriterMock.rewrite).calledWithExactly([mutatedFile, testFile]);
    expect(sandboxTSConfigRewriterMock.rewrite).calledBefore(injectorMock.injectFunction);
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
