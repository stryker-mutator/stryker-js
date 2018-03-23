import * as path from 'path';
import { expect } from 'chai';
import ConfigLoader from '../../../src/compiler/ConfigLoader';
import { Configuration, Compiler, Plugin } from 'webpack';
import { createStrykerWebpackConfig } from '../../helpers/producers';

class FooPlugin implements Plugin { foo = true; apply(compiler: Compiler): void { } }
class ProgressPlugin implements Plugin { apply(compiler: Compiler): void { } }
class BarPlugin implements Plugin { bar = true; apply(compiler: Compiler): void { } }

describe('ConfigLoader', () => {
  let sut: ConfigLoader;
  let requireStub: sinon.SinonStub;

  beforeEach(() => {
    requireStub = sandbox.stub();
    sut = new ConfigLoader(requireStub);
  });

  it('should load webpack config from given location', () => {
    requireStub.returns('resolved');
    const result = sut.load(createStrykerWebpackConfig({ configFile: 'webpack.foo.config.js' }));
    expect(result).eq('resolved');
    expect(requireStub).calledWith(path.resolve('webpack.foo.config.js'));
  });

  it('should remove "ProgressPlugin" if silent is `true`', () => {
    // Arrange
    const bazPlugin = { baz: true, apply() { } };
    const webpackConfig: Configuration = {
      plugins: [new FooPlugin(), new ProgressPlugin(), new BarPlugin(), bazPlugin]
    };
    requireStub.returns(webpackConfig);

    // Act
    const result = sut.load(createStrykerWebpackConfig({ configFile: 'webpack.config.js', silent: true }));

    console.log(result.plugins);

    // Assert
    expect(result.plugins).to.be.an('array').that.does.not.deep.include(new ProgressPlugin());
    expect(result.plugins).to.be.an('array').that.deep.equals([new FooPlugin(), new BarPlugin(), bazPlugin]);
    expect(logMock.debug).calledWith('Removing webpack plugin "%s" to keep webpack bundling silent. Set `webpack: { silent: false }` in your stryker.conf.js file to disable this feature.', 'ProgressPlugin');
  });

  it('should not remove "ProgressPlugin" if silent is `false`', () => {
    const webpackConfig: Configuration = {
      plugins: [new ProgressPlugin(), new BarPlugin()]
    };
    requireStub.returns(webpackConfig);
    const result = sut.load(createStrykerWebpackConfig({ configFile: 'webpack.config.js', silent: false }));
    expect(result.plugins).to.be.an('array').that.does.deep.include(new ProgressPlugin());
  });

  it('should return an object with the context property pointing to the projectRoot when webpack.config.js does not exist', () => {
    const contextPath: string = '/path/to/project/root';
    requireStub.throws(Error('ENOENT: no such file or directory, open webpack.config.js'));

    const result = sut.load(createStrykerWebpackConfig({ context: contextPath }));

    expect(result).to.deep.equal({ context: contextPath });
  });

  it('should report an error when a non-existent webpack config file location is provided by the user', () => {
    const configFile = 'non-existent.webpack.config.js';
    requireStub.throws(Error('ENOENT: no such file or directory, open webpack.config.js'));

    const loadFn = () => sut.load(createStrykerWebpackConfig({ configFile }));

    expect(loadFn).to.throw(Error, `Could not load webpack config at "${configFile}", file not found.`);
  });
});
