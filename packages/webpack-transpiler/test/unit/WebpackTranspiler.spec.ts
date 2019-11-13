import { File } from '@stryker-mutator/api/core';
import { commonTokens } from '@stryker-mutator/api/plugin';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { Configuration } from 'webpack';

import ConfigLoader from '../../src/compiler/ConfigLoader';
import WebpackCompiler, * as webpackCompilerModule from '../../src/compiler/WebpackCompiler';
import WebpackTranspiler from '../../src/WebpackTranspiler';
import { createMockInstance, createStrykerWebpackConfig, createTextFile, Mock } from '../helpers/producers';

describe('WebpackTranspiler', () => {
  let webpackTranspiler: WebpackTranspiler;

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

    sinon.stub(webpackCompilerModule, 'default').returns(webpackCompilerStub);

    testInjector.options.webpack = { context: '/path/to/project/root' };
  });

  it('should only create the compiler once', async () => {
    webpackTranspiler = createSut();
    await webpackTranspiler.transpile([]);
    await webpackTranspiler.transpile([]);

    expect(webpackCompilerModule.default).calledOnce;
    expect(webpackCompilerModule.default).calledWithNew;
    expect(configLoaderStub.load).calledOnce;
    expect(configLoaderStub.load).calledWith(createStrykerWebpackConfig());
  });

  it('should throw an error if `produceSourceMaps` is `true`', () => {
    testInjector.options.coverageAnalysis = 'perTest';
    expect(
      () => new WebpackTranspiler(factory.strykerOptions({ coverageAnalysis: 'perTest' }), true, (configLoaderStub as unknown) as ConfigLoader)
    ).throws(
      'Invalid `coverageAnalysis` "perTest" is not supported by the stryker-webpack-transpiler (yet). It is not able to produce source maps yet. Please set it "coverageAnalysis" to "off"'
    );
  });

  it('should call the webpackCompiler.writeFilesToFs function with the given files', async () => {
    webpackTranspiler = createSut();
    const files = [createTextFile('main.js'), createTextFile('sum.js'), createTextFile('divide.js')];

    await webpackTranspiler.transpile(files);

    expect(webpackCompilerStub.writeFilesToFs).calledWith(files);
  });

  it('should call the webpackCompiler.emit function to get the new bundled files', async () => {
    webpackTranspiler = createSut();
    await webpackTranspiler.transpile([]);

    expect(webpackCompilerStub.emit).called;
    expect(webpackCompilerStub.emit).calledOnce;
  });

  it('should return all files (input and output) on success', async () => {
    webpackTranspiler = createSut();
    const input = new File('input.js', '');
    const transpiledFiles = await webpackTranspiler.transpile([input]);
    expect(transpiledFiles).to.deep.equal([input, exampleBundleFile]);
  });

  it('should return a error result when an error occurred', async () => {
    webpackTranspiler = createSut();
    const fakeError = new Error('compiler could not compile input files');
    webpackCompilerStub.emit.throwsException(fakeError);
    expect(webpackTranspiler.transpile([])).rejectedWith(fakeError);
  });

  function createSut() {
    return testInjector.injector
      .provideValue(commonTokens.produceSourceMaps, false)
      .provideValue('configLoader', (configLoaderStub as unknown) as ConfigLoader)
      .injectClass(WebpackTranspiler);
  }
});
