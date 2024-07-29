import path from 'path';

import { fileURLToPath } from 'url';

import { testInjector, tick } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import { Config, ConfigOptions, ClientOptions } from 'karma';
import sinon from 'sinon';
import type { requireResolve } from '@stryker-mutator/util';

import { configureKarma as sut } from '../../../src/karma-plugins/stryker-karma.conf.js';
import { strykerReporterFactory } from '../../../src/karma-plugins/stryker-reporter.js';
import { TestHooksMiddleware, TEST_HOOKS_FILE_NAME } from '../../../src/karma-plugins/test-hooks-middleware.js';

describe('stryker-karma.conf.js', () => {
  let getLogger: sinon.SinonStub;
  let requireResolveStub: sinon.SinonStubbedMember<typeof requireResolve>;
  let config: Config;

  beforeEach(() => {
    config = new KarmaConfigMock();
    getLogger = sinon.stub();
    getLogger.returns(testInjector.logger);
    requireResolveStub = sinon.stub();
    sut.setGlobals({
      getLogger,
    });
  });

  afterEach(() => {
    sut.setGlobals({});
  });

  function act() {
    return sut(config, requireResolveStub);
  }

  it('should create the correct logger', async () => {
    await act();
    expect(getLogger).calledWith('stryker-karma.conf.js');
  });

  it('should set default options', async () => {
    const expected = {
      browsers: ['ChromeHeadless'],
      frameworks: ['jasmine'],
    };
    await act();
    expect(config).deep.include(expected);
  });

  it('should set user configuration from a custom karma.conf.js file', async () => {
    // Arrange
    requireResolveStub.returns((conf: Config) =>
      conf.set({
        basePath: 'foobar',
        frameworks: ['mocha'],
      }),
    );
    sut.setGlobals({ karmaConfigFile: 'foobar.conf.js' });

    // Act
    await act();

    // Assert
    expect(config).deep.include({ basePath: 'foobar' });
    expect(config).deep.include({ frameworks: ['mocha'] });
    expect(requireResolveStub).calledWith(path.resolve('foobar.conf.js'));
  });

  it('should allow for user configuration to return a promise from a custom karma.conf.js file', async () => {
    // Arrange
    requireResolveStub.returns(async (conf: Config) => {
      await tick();
      conf.set({ basePath: 'foobar' });
    });
    sut.setGlobals({ karmaConfigFile: 'foobar.conf.js' });

    // Act
    const onGoingAct = act();

    // Assert
    expect(config).not.deep.include({ basePath: 'foobar' });
    await onGoingAct;
    expect(config).deep.include({ basePath: 'foobar' });
  });

  it('should set user configuration from a custom karma.conf.js file', async () => {
    // Arrange
    requireResolveStub.returns((conf: Config) =>
      conf.set({
        basePath: 'foobar',
        frameworks: ['mocha'],
      }),
    );
    sut.setGlobals({ karmaConfigFile: 'foobar.conf.js' });

    // Act
    await act();

    // Assert
    expect(config).deep.include({ basePath: 'foobar' });
    expect(config).deep.include({ frameworks: ['mocha'] });
    expect(requireResolveStub).calledWith(path.resolve('foobar.conf.js'));
  });

  it('should log an error if the karma config file could not be found', async () => {
    // Arrange
    const actualError = new Error('Module not found') as NodeJS.ErrnoException;
    actualError.code = 'MODULE_NOT_FOUND';
    requireResolveStub.throws(actualError);
    const expectedKarmaConfigFile = 'foobar.conf.js';
    sut.setGlobals({ getLogger, karmaConfigFile: expectedKarmaConfigFile });

    // Act
    await act();

    // Assert
    expect(testInjector.logger.error).calledWithMatch(
      `Unable to find karma config at "foobar.conf.js" (tried to load from ${path.resolve(expectedKarmaConfigFile)})`,
    );
    expect(requireResolveStub).calledWith(path.resolve(expectedKarmaConfigFile));
  });

  it("should reject if the user's karma config file didn't export a function", async () => {
    sut.setGlobals({ karmaConfigFile: 'foo.js' });
    requireResolveStub.returns({ foo: 'bar' });
    await expect(act()).rejectedWith(`Karma config file "${path.resolve('foo.js')}" should export a function! Found: object`);
  });

  it('should set user configuration from custom karma config', async () => {
    sut.setGlobals({ karmaConfig: { basePath: 'foobar' } });
    await act();
    expect(config).deep.include({ basePath: 'foobar' });
  });

  it("should force some options that relate to karma's life cycle", async () => {
    config.set({ browserNoActivityTimeout: 1, autoWatch: true, singleRun: true, detached: true });
    await act();
    expect(config).deep.include({
      autoWatch: false,
      browserNoActivityTimeout: 1000000,
      detached: false,
      singleRun: false,
    });
  });

  // See https://github.com/stryker-mutator/stryker-js/issues/2049
  it('should force clearContext to false', async () => {
    // Arrange
    sut.setGlobals({ getLogger, karmaConfigFile: 'karma.conf.js' });
    requireResolveStub.returns((conf: Config) => conf.set({ client: { clearContext: true }, frameworks: ['mocha'] }));

    // Act
    await act();

    // Assert
    expect(config.client?.clearContext).false;
  });

  it('should force non-random and failFast options when dealing with jasmine', async () => {
    // Arrange
    sut.setGlobals({ getLogger, karmaConfigFile: 'karma.conf.js' });
    requireResolveStub.returns((conf: Config) => conf.set({ client: { jasmine: { random: true } } as ClientOptions, frameworks: ['jasmine'] }));

    // Act
    await act();

    // Assert
    const clientConfig = config.client as any;
    expect(clientConfig.jasmine).deep.eq({
      random: false,
      failFast: true,
      oneFailurePerSpec: true,
      stopOnSpecFailure: true,
      stopSpecOnExpectationFailure: true,
    });
    expect(clientConfig.mocha).undefined;
  });

  it('should force bail options when dealing with mocha', async () => {
    // Arrange
    sut.setGlobals({ getLogger, karmaConfigFile: 'karma.conf.js' });
    requireResolveStub.returns((conf: Config) => conf.set({ client: { mocha: { bail: false } } as ClientOptions, frameworks: ['mocha'] }));

    // Act
    await act();

    // Assert
    const clientConfig = config.client as any;
    expect(clientConfig.jasmine).undefined;
    expect(clientConfig.mocha).deep.include({ bail: true });
  });

  it('should configure the tests hooks middleware', async () => {
    // Arrange
    sinon.stub(TestHooksMiddleware.instance, 'configureTestFramework');
    requireResolveStub.returns((conf: Config) =>
      conf.set({
        frameworks: ['my', 'framework'],
      }),
    );
    sut.setGlobals({ karmaConfigFile: 'foobar.conf.js' });

    // Act
    await act();

    // Assert
    expect(config.files).deep.include({ pattern: TEST_HOOKS_FILE_NAME, included: true, watched: false, served: false, nocache: true });
    expect(config.plugins).include('karma-*');
    expect(config.plugins).deep.include({ ['middleware:TestHooksMiddleware']: ['value', TestHooksMiddleware.instance.handler] });
    expect(TestHooksMiddleware.instance.configureTestFramework).calledWith(['my', 'framework']);
  });

  it('should configure the stryker reporter', async () => {
    await act();
    expect(config.reporters).deep.eq(['StrykerReporter']);
    expect(config.plugins).include('karma-*');
    expect(config.plugins).deep.include({ ['reporter:StrykerReporter']: ['factory', strykerReporterFactory] });
  });

  it('should configure the stryker coverage adapter', async () => {
    await act();
    expect(config.files![0]).deep.eq({
      pattern: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../src/karma-plugins/stryker-mutant-coverage-adapter.js'),
      included: true,
      watched: false,
      served: true,
      nocache: true,
      type: 'module',
    });
  });

  it('should allow custom plugins', async () => {
    sut.setGlobals({ karmaConfig: { plugins: ['foobarPlugin'] } });
    await act();
    expect(config.plugins).include('foobarPlugin');
  });

  it('should set basePath to location of karma.conf.js', async () => {
    sut.setGlobals({ karmaConfigFile: '../foobar.conf.js', disableBail: false });
    requireResolveStub.returns(() => {
      /* noop */
    });
    await act();
    expect(config).deep.include({
      basePath: path.resolve('../'),
      configFile: path.resolve('../foobar.conf.js'),
    });
  });

  it('should allow for custom basePath', async () => {
    const expectedBasePath = path.resolve('../baz');
    sut.setGlobals({ karmaConfigFile: '../foobar.conf.js' });
    requireResolveStub.returns((configuration: Config) => configuration.set({ basePath: expectedBasePath }));
    await act();
    expect(config).deep.include({
      basePath: path.resolve(expectedBasePath),
      configFile: path.resolve('../foobar.conf.js'),
    });
  });

  it('should default basePath to cwd', async () => {
    await act();
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
