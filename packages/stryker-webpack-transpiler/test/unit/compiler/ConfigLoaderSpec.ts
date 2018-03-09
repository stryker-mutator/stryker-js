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
    const result = sut.load(createStrykerWebpackConfig({ silent: true }));

    // Assert
    expect(result.plugins).deep.eq([new FooPlugin(), new BarPlugin(), bazPlugin]);
    expect(logMock.debug).calledWith('Removing webpack plugin "%s" to keep webpack bundling silent. Set `webpack: { silent: false }` in your stryker.conf.js file to disable this feature.', 'ProgressPlugin');
  });

  it('should remove "ProgressPlugin" if silent is `false`', () => {
    const webpackConfig: Configuration = {
      plugins: [new ProgressPlugin(), new BarPlugin()]
    };
    requireStub.returns(webpackConfig);
    const result = sut.load(createStrykerWebpackConfig({ silent: false }));
    expect(result.plugins).deep.eq([new ProgressPlugin(), new BarPlugin()]);
  });

  it('should return a object with the context property pointing to the projectRoot when webpack.config.js does not exist', () => {
    const contextPath: string = '/path/to/project/root';
    requireStub.throws(Error('ENOENT: no such file or directory, open webpack.config.js'));
    
    const result = sut.load(createStrykerWebpackConfig({ silent: false, context: contextPath }));

    expect(result).to.deep.equal({ context: contextPath });
  });
});
