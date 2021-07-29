import path from 'path';

import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import { Config, ConfigOptions, ClientOptions } from 'karma';
import sinon from 'sinon';
import * as utils from '@stryker-mutator/util';

import sut from '../../../src/starters/stryker-karma.conf';
import { strykerReporterFactory } from '../../../src/karma-plugins/stryker-reporter';
import { TestHooksMiddleware, TEST_HOOKS_FILE_NAME } from '../../../src/karma-plugins/test-hooks-middleware';

describe('stryker-karma.conf.js', () => {
  let getLogger: sinon.SinonStub;
  let requireModuleStub: sinon.SinonStub;
  let config: Config;

  beforeEach(() => {
    config = new KarmaConfigMock();
    getLogger = sinon.stub();
    getLogger.returns(testInjector.logger);
    requireModuleStub = sinon.stub(utils, 'requireResolve');
    sut.setGlobals({
      getLogger,
    });
  });

  afterEach(() => {
    sut.setGlobals({});
  });

  it('should create the correct logger', () => {
    sut(config);
    expect(getLogger).calledWith('stryker-karma.conf.js');
  });

  it('should set default options', () => {
    const expected = {
      browsers: ['ChromeHeadless'],
      frameworks: ['jasmine'],
    };
    sut(config);
    expect(config).deep.include(expected);
  });

  it('should set user configuration from a custom karma.conf.js file', () => {
    // Arrange
    requireModuleStub.returns((conf: Config) =>
      conf.set({
        basePath: 'foobar',
        frameworks: ['mocha'],
      })
    );
    sut.setGlobals({ karmaConfigFile: 'foobar.conf.js' });

    // Act
    sut(config);

    // Assert
    expect(config).deep.include({ basePath: 'foobar' });
    expect(config).deep.include({ frameworks: ['mocha'] });
    expect(requireModuleStub).calledWith(path.resolve('foobar.conf.js'));
  });

  it('should log an error if the karma config file could not be found', () => {
    // Arrange
    const actualError = new Error('Module not found') as NodeJS.ErrnoException;
    actualError.code = 'MODULE_NOT_FOUND';
    requireModuleStub.throws(actualError);
    const expectedKarmaConfigFile = 'foobar.conf.js';
    sut.setGlobals({ getLogger, karmaConfigFile: expectedKarmaConfigFile });

    // Act
    sut(config);

    // Assert
    expect(testInjector.logger.error).calledWithMatch(
      `Unable to find karma config at "foobar.conf.js" (tried to load from ${path.resolve(expectedKarmaConfigFile)})`
    );
    expect(requireModuleStub).calledWith(path.resolve(expectedKarmaConfigFile));
  });

  it("should throw if the user's karma config file didn't export a function", () => {
    sut.setGlobals({ karmaConfigFile: 'foo.js' });
    requireModuleStub.returns({ foo: 'bar' });
    expect(() => sut(config)).throws(`Karma config file "${path.resolve('foo.js')}" should export a function! Found: object`);
  });

  it('should set user configuration from custom karma config', () => {
    sut.setGlobals({ karmaConfig: { basePath: 'foobar' } });
    sut(config);
    expect(config).deep.include({ basePath: 'foobar' });
  });

  it("should force some options that relate to karma's life cycle", () => {
    config.set({ browserNoActivityTimeout: 1, autoWatch: true, singleRun: true, detached: true });
    sut(config);
    expect(config).deep.include({
      autoWatch: false,
      browserNoActivityTimeout: 1000000,
      detached: false,
      singleRun: false,
    });
  });

  // See https://github.com/stryker-mutator/stryker-js/issues/2049
  it('should force clearContext to false', () => {
    // Arrange
    sut.setGlobals({ getLogger, karmaConfigFile: 'karma.conf.js' });
    requireModuleStub.returns((conf: Config) => conf.set({ client: { clearContext: true }, frameworks: ['mocha'] }));

    // Act
    sut(config);

    // Assert
    expect(config.client?.clearContext).false;
  });

  it('should force non-random and failFast options when dealing with jasmine', () => {
    // Arrange
    sut.setGlobals({ getLogger, karmaConfigFile: 'karma.conf.js' });
    requireModuleStub.returns((conf: Config) => conf.set({ client: { jasmine: { random: true } } as ClientOptions, frameworks: ['jasmine'] }));

    // Act
    sut(config);

    // Assert
    const clientConfig = config.client as any;
    expect(clientConfig.jasmine).deep.eq({ random: false, failFast: true });
    expect(clientConfig.mocha).undefined;
  });

  it('should force bail options when dealing with mocha', () => {
    // Arrange
    sut.setGlobals({ getLogger, karmaConfigFile: 'karma.conf.js' });
    requireModuleStub.returns((conf: Config) => conf.set({ client: { mocha: { bail: false } } as ClientOptions, frameworks: ['mocha'] }));

    // Act
    sut(config);

    // Assert
    const clientConfig = config.client as any;
    expect(clientConfig.jasmine).undefined;
    expect(clientConfig.mocha).deep.include({ bail: true });
  });

  it('should configure the tests hooks middleware', () => {
    // Arrange
    sinon.stub(TestHooksMiddleware.instance, 'configureTestFramework');
    requireModuleStub.returns((conf: Config) =>
      conf.set({
        frameworks: ['my', 'framework'],
      })
    );
    sut.setGlobals({ karmaConfigFile: 'foobar.conf.js' });

    // Act
    sut(config);

    // Assert
    expect(config.files).deep.include({ pattern: TEST_HOOKS_FILE_NAME, included: true, watched: false, served: false, nocache: true });
    expect(config.plugins).include('karma-*');
    expect(config.plugins).deep.include({ ['middleware:TestHooksMiddleware']: ['value', TestHooksMiddleware.instance.handler] });
    expect(TestHooksMiddleware.instance.configureTestFramework).calledWith(['my', 'framework']);
  });

  it('should configure the stryker reporter', () => {
    sut(config);
    expect(config.reporters).deep.eq(['StrykerReporter']);
    expect(config.plugins).include('karma-*');
    expect(config.plugins).deep.include({ ['reporter:StrykerReporter']: ['factory', strykerReporterFactory] });
  });

  it('should configure the stryker coverage adapter', () => {
    sut(config);
    expect(config.files![0]).deep.eq({
      pattern: require.resolve('../../../src/karma-plugins/stryker-mutant-coverage-adapter'),
      included: true,
      watched: false,
      served: true,
      nocache: true,
    });
  });

  it('should allow custom plugins', () => {
    sut.setGlobals({ karmaConfig: { plugins: ['foobarPlugin'] } });
    sut(config);
    expect(config.plugins).include('foobarPlugin');
  });

  it('should set basePath to location of karma.conf.js', () => {
    sut.setGlobals({ karmaConfigFile: '../foobar.conf.js' });
    requireModuleStub.returns(() => {
      /* noop */
    });
    sut(config);
    expect(config).deep.include({
      basePath: path.resolve('../'),
      configFile: path.resolve('../foobar.conf.js'),
    });
  });

  it('should allow for custom basePath', () => {
    const expectedBasePath = path.resolve('../baz');
    sut.setGlobals({ karmaConfigFile: '../foobar.conf.js' });
    requireModuleStub.returns((configuration: Config) => configuration.set({ basePath: expectedBasePath }));
    sut(config);
    expect(config).deep.include({
      basePath: path.resolve(expectedBasePath),
      configFile: path.resolve('../foobar.conf.js'),
    });
  });

  it('should default basePath to cwd', () => {
    sut(config);
    expect(config).deep.include({ basePath: process.cwd() });
  });
});

class KarmaConfigMock implements Config {
  public set(config: ConfigOptions) {
    for (const prop in config) {
      if (prop !== 'set') {
        (this as any)[prop] = (config as any)[prop];
      }
    }
  }
  public LOG_DISABLE = 'off';
  public LOG_ERROR = 'error';
  public LOG_WARN = 'warn';
  public LOG_INFO = 'info';
  public LOG_DEBUG = 'debug';
}
