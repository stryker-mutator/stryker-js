import WebpackTranspiler from '../../src/WebpackTranspiler';
import ConfigLoader, * as configLoaderModule from '../../src/compiler/ConfigLoader';
import WebpackCompiler, * as webpackCompilerModule from '../../src/compiler/WebpackCompiler';
import { createTextFile, Mock, createMockInstance, createStrykerWebpackConfig } from '../helpers/producers';
import { Config } from 'stryker-api/config';
import { Position, TextFile } from 'stryker-api/core';
import { expect } from 'chai';
import { Configuration } from 'webpack';
import * as log4js from 'log4js';

describe('WebpackTranspiler', () => {
  let webpackTranspiler: WebpackTranspiler;
  let config: Config;

  // Stubs
  let configLoaderStub: Mock<ConfigLoader>;
  let webpackCompilerStub: Mock<WebpackCompiler>;

  let exampleBundleFile: TextFile = createTextFile('bundle.js');
  let webpackConfig: Configuration;

  beforeEach(() => {
    webpackCompilerStub = createMockInstance(WebpackCompiler);
    webpackCompilerStub.emit.returns([exampleBundleFile]);

    webpackConfig = { entry: './main.js' };
    configLoaderStub = createMockInstance(ConfigLoader);
    configLoaderStub.load.returns(webpackConfig); 

    sandbox.stub(log4js, 'setGlobalLogLevel');
    sandbox.stub(configLoaderModule, 'default').returns(configLoaderStub);
    sandbox.stub(webpackCompilerModule, 'default').returns(webpackCompilerStub);

    config = new Config;
    config.set({ webpack: {} });
  });

  it('should only create the compiler once', async () => {
    webpackTranspiler = new WebpackTranspiler({ config, keepSourceMaps: false });
    await webpackTranspiler.transpile([]);
    await webpackTranspiler.transpile([]);

    expect(configLoaderModule.default).calledOnce;
    expect(configLoaderModule.default).calledWithNew;
    expect(webpackCompilerModule.default).calledOnce;
    expect(webpackCompilerModule.default).calledWithNew;
    expect(configLoaderStub.load).calledOnce;
    expect(configLoaderStub.load).calledWith(createStrykerWebpackConfig());
  });

  it('should set global log level when compiler is called', () => {
    config.logLevel = 'foobar level';
    new WebpackTranspiler({ config, keepSourceMaps: false });
    expect(log4js.setGlobalLogLevel).calledWith('foobar level');
  });

  it('should call the webpackCompiler.writeFilesToFs function with the given files', async () => {
    webpackTranspiler = new WebpackTranspiler({ config, keepSourceMaps: false });
    const files = [createTextFile('main.js'), createTextFile('sum.js'), createTextFile('divide.js')];

    await webpackTranspiler.transpile(files);

    expect(webpackCompilerStub.writeFilesToFs).calledWith(files);
  });

  it('should call the webpackCompiler.emit function to get the new bundled files', async () => {
    webpackTranspiler = new WebpackTranspiler({ config, keepSourceMaps: false });
    await webpackTranspiler.transpile([]);

    expect(webpackCompilerStub.emit).called;
    expect(webpackCompilerStub.emit).calledOnce;
  });

  it('should return a successResult with the bundled files on success', async () => {
    webpackTranspiler = new WebpackTranspiler({ config, keepSourceMaps: false });
    const transpileResult = await webpackTranspiler.transpile([]);

    expect(transpileResult.error).to.be.null;
    expect(transpileResult.outputFiles).to.deep.equal([exampleBundleFile]);
  });

  it('should return a error result when an error occurred', async () => {
    webpackTranspiler = new WebpackTranspiler({ config, keepSourceMaps: false });
    const fakeError = 'compiler could not compile input files';
    webpackCompilerStub.emit.throwsException(Error(fakeError));

    const transpileResult = await webpackTranspiler.transpile([]);

    expect(transpileResult.outputFiles).to.be.an('array').that.is.empty;
    expect(transpileResult.error).to.equal(`Error: ${fakeError}`);
  });

  it('should throw a not implemented error when calling the getMappedLocation method', () => {
    webpackTranspiler = new WebpackTranspiler({ config, keepSourceMaps: false });
    const position: Position = {
      line: 0,
      column: 0
    };

    const fileLocation: { fileName: string, start: Position, end: Position } = {
      fileName: 'test',
      start: position,
      end: position
    };

    expect(webpackTranspiler.getMappedLocation.bind(this, fileLocation)).to.throw(Error, 'Method not implemented.');
  });
});
