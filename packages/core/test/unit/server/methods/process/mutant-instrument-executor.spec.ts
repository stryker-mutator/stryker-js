import sinon from 'sinon';
import { expect } from 'chai';
import { Injector } from 'typed-inject';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { Instrumenter, InstrumentResult, InstrumenterOptions, createInstrumenter } from '@stryker-mutator/instrumenter';
import { FileDescriptions } from '@stryker-mutator/api/core';
import { PluginKind } from '@stryker-mutator/api/plugin';

import { MutantInstrumenterExecutor } from '../../../../../src/server/methods/process/mutant-instrument-executor.js';
import { DryRunContext, MutantInstrumenterContext } from '../../../../../src/process/index.js';
import { Project } from '../../../../../src/fs/index.js';
import { PluginCreator } from '../../../../../src/di/index.js';
import { FileSystemTestDouble } from '../../../../helpers/file-system-test-double.js';

describe(MutantInstrumenterExecutor.name, () => {
  let sut: MutantInstrumenterExecutor;
  let project: Project;
  let injectorMock: sinon.SinonStubbedInstance<Injector<DryRunContext>>;
  let instrumenterStub: sinon.SinonStubbedInstance<Instrumenter>;
  let instrumentResult: InstrumentResult;
  let pluginCreatorMock: sinon.SinonStubbedInstance<PluginCreator>;

  beforeEach(() => {
    const fsTestDouble = new FileSystemTestDouble({ 'foo.js': 'console.log("bar")', 'foo.spec.js': '' });
    const fileDescriptions: FileDescriptions = { 'foo.js': { mutate: true }, 'foo.spec.js': { mutate: false } };
    project = new Project(fsTestDouble, fileDescriptions);
    instrumentResult = {
      files: [{ name: 'foo.js', content: 'console.log(global.activeMutant === 1? "": "bar")', mutate: true }],
      mutants: [factory.mutant({ id: '1', replacement: 'bar', location: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } } })],
    };
    instrumenterStub = sinon.createStubInstance(Instrumenter);
    injectorMock = factory.injector() as unknown as sinon.SinonStubbedInstance<Injector<DryRunContext>>;
    pluginCreatorMock = sinon.createStubInstance(PluginCreator);
    sut = new MutantInstrumenterExecutor(injectorMock as Injector<MutantInstrumenterContext>, project, testInjector.options, pluginCreatorMock);
    injectorMock.injectFunction.withArgs(createInstrumenter).returns(instrumenterStub);
    instrumenterStub.instrument.resolves(instrumentResult);
  });

  it('should instrument the given files', async () => {
    testInjector.options.mutator.plugins = ['functionSent'];
    testInjector.options.mutator.excludedMutations = ['fooMutator'];
    await sut.execute();
    const expectedInstrumenterOptions: InstrumenterOptions = { ...testInjector.options.mutator, ignorers: [] };
    sinon.assert.calledOnceWithExactly(
      instrumenterStub.instrument,
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
      instrumenterStub.instrument,
      [{ name: 'foo.js', content: 'console.log("bar")', mutate: true }],
      expectedInstrumenterOptions,
    );
    sinon.assert.calledOnceWithExactly(pluginCreatorMock.create, PluginKind.Ignore, 'notIgnorer');
  });

  it('should correct mutant locations so numbering is not zero-based', async () => {
    const actual = await sut.execute();
    expect(actual).lengthOf(1);
    expect(actual[0].location).deep.eq({
      start: { line: 1, column: 1 },
      end: { line: 1, column: 1 },
    });
  });
});
