import { File } from '@stryker-mutator/api/core';

import { Injector } from 'typed-inject';

import { factory } from '@stryker-mutator/test-helpers';
import { Instrumenter, InstrumentResult } from '@stryker-mutator/instrumenter';

import sinon = require('sinon');

import { expect } from 'chai';

import { MutantInstrumenterExecutor } from '../../../src/process';
import InputFileCollection from '../../../src/input/InputFileCollection';
import { Sandbox } from '../../../src/sandbox/sandbox';
import { coreTokens } from '../../../src/di';

describe(MutantInstrumenterExecutor.name, () => {
  let sut: MutantInstrumenterExecutor;
  let inputFiles: InputFileCollection;
  let injectorMock: sinon.SinonStubbedInstance<Injector>;
  let instrumenterMock: sinon.SinonStubbedInstance<Instrumenter>;
  let instrumentResult: InstrumentResult;
  let sandboxMock: sinon.SinonStubbedInstance<Sandbox>;
  let mutatedFile: File;
  let originalFile: File;
  let testFile: File;

  beforeEach(() => {
    mutatedFile = new File('foo.js', 'console.log(global.activeMutant === 1? "": "bar")');
    originalFile = new File('foo.js', 'console.log("bar")');
    testFile = new File('foo.spec.js', '');

    instrumentResult = {
      files: [mutatedFile],
      mutants: [factory.mutant({ id: 1, replacement: 'bar' })],
    };
    sandboxMock = sinon.createStubInstance(Sandbox);
    instrumenterMock = sinon.createStubInstance(Instrumenter);
    inputFiles = new InputFileCollection([originalFile, testFile], [mutatedFile.name]);
    injectorMock = factory.injector();
    sut = new MutantInstrumenterExecutor(injectorMock, inputFiles);
    injectorMock.injectClass.withArgs(Instrumenter).returns(instrumenterMock);
    injectorMock.injectFunction.withArgs(Sandbox.create).returns(sandboxMock);
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

  it('should provide the mutated files to the sandbox', async () => {
    await sut.execute();
    expect(injectorMock.provideValue).calledWithExactly(coreTokens.files, [mutatedFile, testFile]);
    expect(injectorMock.provideValue.withArgs(coreTokens.files)).calledBefore(injectorMock.injectFunction);
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
