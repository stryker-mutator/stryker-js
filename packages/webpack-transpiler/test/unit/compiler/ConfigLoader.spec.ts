import * as fs from 'fs';
import * as path from 'path';

import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { Configuration, Plugin } from 'webpack';

import ConfigLoader from '../../../src/compiler/ConfigLoader';
import { pluginTokens } from '../../../src/pluginTokens';
import { createWebpackOptions } from '../../helpers/producers';

class FooPlugin implements Plugin {
  public foo = true;
  public apply() {}
}
class ProgressPlugin implements Plugin {
  public apply() {}
}
class BarPlugin implements Plugin {
  public bar = true;
  public apply() {}
}

describe('ConfigLoader', () => {
  let sut: ConfigLoader;
  let requireStub: sinon.SinonStub;
  let existsSyncStub: sinon.SinonStub;

  beforeEach(() => {
    requireStub = sinon.stub();
    existsSyncStub = sinon.stub(fs, 'existsSync');

    sut = testInjector.injector.provideValue(pluginTokens.require, requireStub).injectClass(ConfigLoader);
  });

  it('should load webpack config from given location', async () => {
    requireStub.returns('resolved');
    existsSyncStub.returns(true);

    const result = await sut.load(createWebpackOptions({ configFile: 'webpack.foo.config.js' }));
    expect(result).eq('resolved');
    expect(requireStub).calledWith(path.resolve('webpack.foo.config.js'));
  });

  it('should call function if webpack config file exports a function', async () => {
    const configFunctionStub = sinon.stub();
    configFunctionStub.returns('webpackconfig');
    requireStub.returns(configFunctionStub);
    existsSyncStub.returns(true);

    const result = await sut.load(createWebpackOptions({ configFile: 'webpack.foo.config.js' }));
    expect(result).eq('webpackconfig');
    expect(requireStub).calledWith(path.resolve('webpack.foo.config.js'));
    expect(configFunctionStub).called;
  });

  it('should remove "ProgressPlugin" if silent is `true`', async () => {
    // Arrange
    const bazPlugin = { baz: true, apply() {} };
    const webpackConfig: Configuration = {
      plugins: [new FooPlugin(), new ProgressPlugin(), new BarPlugin(), bazPlugin]
    };

    requireStub.returns(webpackConfig);
    existsSyncStub.returns(true);

    // Act
    const result = await sut.load(createWebpackOptions({ configFile: 'webpack.config.js', silent: true }));

    // Assert
    expect(result.plugins).to.be.an('array').that.does.not.deep.include(new ProgressPlugin());
    expect(result.plugins).to.be.an('array').that.deep.equals([new FooPlugin(), new BarPlugin(), bazPlugin]);
    expect(testInjector.logger.debug).calledWith(
      'Removing webpack plugin "%s" to keep webpack bundling silent. Set `webpack: { silent: false }` in your config file to disable this feature.',
      'ProgressPlugin'
    );
  });

  it('should not remove "ProgressPlugin" if silent is `false`', async () => {
    const webpackConfig: Configuration = {
      plugins: [new ProgressPlugin(), new BarPlugin()]
    };

    requireStub.returns(webpackConfig);
    existsSyncStub.returns(true);

    const result = await sut.load(createWebpackOptions({ configFile: 'webpack.config.js', silent: false }));
    expect(result.plugins).to.be.an('array').that.does.deep.include(new ProgressPlugin());
  });

  it('should return an object with the context property pointing to the projectRoot when webpack.config.js does not exist', async () => {
    const contextPath: string = '/path/to/project/root';

    existsSyncStub.returns(false);

    const result = await sut.load(createWebpackOptions({ context: contextPath }));

    expect(result).to.deep.equal({ context: contextPath });
  });

  it('should report an error when a non-existent webpack config file location is provided by the user', async () => {
    const configFile = 'non-existent.webpack.config.js';

    existsSyncStub.returns(false);

    return expect(sut.load(createWebpackOptions({ configFile }))).rejectedWith(
      `Could not load webpack config at "${path.resolve(configFile)}", file not found.`
    );
  });

  it("should log a debug message when the Webpack configuration is not found and it's trying webpack 4 zero config instead", async () => {
    const contextPath: string = '/path/to/project/root';

    existsSyncStub.returns(false);

    await sut.load(createWebpackOptions({ context: contextPath }));

    expect(testInjector.logger.debug).calledWith('Webpack config "%s" not found, trying Webpack 4 zero config');
  });

  it('should be able to load a webpack configuration asynchonously via a promise', async () => {
    requireStub.returns(Promise.resolve('resolved'));
    existsSyncStub.returns(true);

    const result = await sut.load(createWebpackOptions({ configFile: 'webpack.foo.config.js' }));

    expect(result).eq('resolved');
    expect(requireStub).calledWith(path.resolve('webpack.foo.config.js'));
  });
});
