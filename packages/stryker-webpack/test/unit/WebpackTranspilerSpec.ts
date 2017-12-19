import WebpackTranspiler from '../../src/WebpackTranspiler';
import PresetLoader, * as presetLoader from '../../src/presetLoader/PresetLoader';
import WebpackCompiler, * as webpackCompiler from '../../src/compiler/WebpackCompiler';
import { createTextFile } from '../helpers/producers';
import * as sinon from 'sinon';
import { Config } from 'stryker-api/config';
import { Position, TextFile } from 'stryker-api/core';
import { expect, assert } from 'chai';

describe('WebpackTranspiler', () => {
  let webpackTranspiler: WebpackTranspiler;
  let sandbox: sinon.SinonSandbox;
  let config: Config
  
  // Stubs
  let presetLoaderStub: { loadPreset: sinon.SinonStub }
  let webpackCompilerStub: WebpackCompilerStub;

  // Example files
  let exampleInitFile: TextFile = createTextFile('exampleInitFile');
  let exampleBundleFile: TextFile = createTextFile('bundle.js');

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    webpackCompilerStub = sinon.createStubInstance(WebpackCompiler);
    webpackCompilerStub.emit.returns([exampleBundleFile]);

    presetLoaderStub = sinon.createStubInstance(PresetLoader);
    presetLoaderStub.loadPreset.returns({ getWebpackConfig: () => {}, getInitFiles: () => [exampleInitFile] });

    sandbox.stub(presetLoader, 'default').returns(presetLoaderStub);
    sandbox.stub(webpackCompiler, 'default').returns(webpackCompilerStub);

    config = new Config;
    config.set({ webpack: { project: 'ExampleProject' } });

    webpackTranspiler = new WebpackTranspiler({ config, keepSourceMaps: false });
  });

  afterEach(() => sandbox.restore());

  it('should call the presetloader with the configured project when the transpile method is called initially', async () => {
    await webpackTranspiler.transpile([]);
    await webpackTranspiler.transpile([]);

    assert(presetLoaderStub.loadPreset.called, 'loadPreset not called');
    assert(presetLoaderStub.loadPreset.calledOnce, 'loadPreset called more than once');
    assert(presetLoaderStub.loadPreset.calledWith('exampleproject'), `loadPreset not called with 'exampleproject'`);
  });

  it('should use \'default\' as preset when none is provided', async () => {
    const config = new Config;
    const webpackTranspiler = new WebpackTranspiler({ config: config, keepSourceMaps: false });

    await webpackTranspiler.transpile([]);

    assert(presetLoaderStub.loadPreset.calledWith('default'), `loadPreset not called with 'default'`);
  });

  it('should call the webpackCompiler.writeFilesToFs method with the output of the webpackPreset.getFiles method', async () => {
    await webpackTranspiler.transpile([]);

    assert(webpackCompilerStub.writeFilesToFs.calledWith([exampleInitFile]), 'Not alled with exampleInitFile');
  });

  it('should call the webpackCompiler.writeFilesToFs function with the given files', async () => {
    const files = [createTextFile('main.js'), createTextFile('sum.js'), createTextFile('divide.js')];

    await webpackTranspiler.transpile(files);

    assert(webpackCompilerStub.writeFilesToFs.calledWith(files), `replace function not called with ${files}`);
  });

  it('should call the webpackCompiler.emit function to get the new bundled files', async () => {
    await webpackTranspiler.transpile([]);

    assert(webpackCompilerStub.emit.called, 'Emit function not called');
    assert(webpackCompilerStub.emit.calledOnce, 'Emit function called more than once');
  });

  it('should return a successResult with the bundled files on success', async () => {
    const transpileResult = await webpackTranspiler.transpile([]);

    expect(transpileResult.error).to.be.null;
    expect(transpileResult.outputFiles).to.deep.equal([exampleBundleFile]);
  });

  it('should return a error result when an error occured', async () => {
    const fakeError = 'compiler could not compile input files';
    webpackCompilerStub.emit.throwsException(Error(fakeError));

    const transpileResult = await webpackTranspiler.transpile([]);
    
    expect(transpileResult.outputFiles).to.be.an("array").that.is.empty;
    expect(transpileResult.error).to.equal(`Error: ${fakeError}`);
  });

  it('should throw a not implemented error when calling the getMappedLocation method', () => {
    const position: Position = {
      line: 0,
      column: 0
    };

    const fileLocation: { fileName: string, start: Position, end: Position } = {
      fileName: "test",
      start: position,
      end: position
    }

    expect(webpackTranspiler.getMappedLocation.bind(this, fileLocation)).to.throw(Error, 'Method not implemented.');
  });
});

interface WebpackCompilerStub {
  writeFilesToFs: sinon.SinonStub;
  emit: sinon.SinonStub;
}