import WebpackTranspiler from '../../src/WebpackTranspiler';
import ConfigLoader, * as configLoaderModule from '../../src/compiler/ConfigLoader';
import WebpackCompiler, * as webpackCompilerModule from '../../src/compiler/WebpackCompiler';
import { createTextFile, Mock, createMockInstance, createStrykerWebpackConfig } from '../helpers/producers';
import { Config } from 'stryker-api/config';
import { File } from 'stryker-api/core';
import { expect } from 'chai';
import { Configuration } from 'webpack';

describe('WebpackTranspiler', () => {
  let webpackTranspiler: WebpackTranspiler;
  let config: Config;

  // Stubs
  let configLoaderStub: Mock<ConfigLoader>;
  let webpackCompilerStub: Mock<WebpackCompiler>;

  const exampleBundleFile: File = createTextFile('bundle.js');
  let webpackConfig: Configuration;

  beforeEach(() => {
    webpackCompilerStub = createMockInstance(WebpackCompiler);
    webpackCompilerStub.emit.returns([exampleBundleFile]);

    webpackConfig = { entry: './main.js' };
    configLoaderStub = createMockInstance(ConfigLoader);
    configLoaderStub.load.returns(webpackConfig);

    sandbox.stub(configLoaderModule, 'default').returns(configLoaderStub);
    sandbox.stub(webpackCompilerModule, 'default').returns(webpackCompilerStub);

    config = new Config();
    config.set({ webpack: { context: '/path/to/project/root' } });
  });

  it('should only create the compiler once', async () => {
    webpackTranspiler = new WebpackTranspiler({ config, produceSourceMaps: false });
    await webpackTranspiler.transpile([]);
    await webpackTranspiler.transpile([]);

    expect(configLoaderModule.default).calledOnce;
    expect(configLoaderModule.default).calledWithNew;
    expect(webpackCompilerModule.default).calledOnce;
    expect(webpackCompilerModule.default).calledWithNew;
    expect(configLoaderStub.load).calledOnce;
    expect(configLoaderStub.load).calledWith(createStrykerWebpackConfig());
  });

  it('should throw an error if `produceSourceMaps` is `true`', () => {
    config.coverageAnalysis = 'perTest';
    expect(() => new WebpackTranspiler({ config, produceSourceMaps: true })).throws('Invalid `coverageAnalysis` "perTest" is not supported by the stryker-webpack-transpiler (yet). It is not able to produce source maps yet. Please set it "coverageAnalysis" to "off"');
  });

  it('should call the webpackCompiler.writeFilesToFs function with the given files', async () => {
    webpackTranspiler = new WebpackTranspiler({ config, produceSourceMaps: false });
    const files = [createTextFile('main.js'), createTextFile('sum.js'), createTextFile('divide.js')];

    await webpackTranspiler.transpile(files);

    expect(webpackCompilerStub.writeFilesToFs).calledWith(files);
  });

  it('should call the webpackCompiler.emit function to get the new bundled files', async () => {
    webpackTranspiler = new WebpackTranspiler({ config, produceSourceMaps: false });
    await webpackTranspiler.transpile([]);

    expect(webpackCompilerStub.emit).called;
    expect(webpackCompilerStub.emit).calledOnce;
  });

  it('should return all files (input and output) on success', async () => {
    webpackTranspiler = new WebpackTranspiler({ config, produceSourceMaps: false });
    const input = new File('input.js', '');
    const transpiledFiles = await webpackTranspiler.transpile([input]);
    expect(transpiledFiles).to.deep.equal([input, exampleBundleFile]);
  });

  it('should return a error result when an error occurred', async () => {
    webpackTranspiler = new WebpackTranspiler({ config, produceSourceMaps: false });
    const fakeError = new Error('compiler could not compile input files');
    webpackCompilerStub.emit.throwsException(fakeError);
    expect(webpackTranspiler.transpile([])).rejectedWith(fakeError);
  });
});
