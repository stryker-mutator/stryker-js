import * as path from 'path';

import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import { Config, ConfigOptions } from 'karma';
import * as sinon from 'sinon';

import sut = require('../../../src/starters/stryker-karma.conf');
import StrykerReporter from '../../../src/StrykerReporter';
import TestHooksMiddleware, { TEST_HOOKS_FILE_NAME } from '../../../src/TestHooksMiddleware';
import * as utils from '../../../src/utils';

describe('stryker-karma.conf.js', () => {
  let getLogger: sinon.SinonStub;
  let requireModuleStub: sinon.SinonStub;
  let config: Config;

  beforeEach(() => {
    config = new KarmaConfigMock();
    getLogger = sinon.stub();
    getLogger.returns(testInjector.logger);
    requireModuleStub = sinon.stub(utils, 'requireModule');
    sut.setGlobals({
      getLogger
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
      browsers: ['PhantomJS'],
      frameworks: ['jasmine']
    };
    sut(config);
    expect(config).deep.include(expected);
  });

  it('should set user configuration from a custom karma.conf.js file', () => {
    // Arrange
    requireModuleStub.returns((conf: Config) =>
      conf.set({
        basePath: 'foobar'
      })
    );
    sut.setGlobals({ karmaConfigFile: 'foobar.conf.js' });

    // Act
    sut(config);

    // Assert
    expect(config).deep.include({ basePath: 'foobar' });
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
      singleRun: false
    });
  });

  it('should configure the tests hooks middleware', () => {
    sut(config);
    expect(config).deep.include({
      files: [{ pattern: TEST_HOOKS_FILE_NAME, included: true, watched: false, served: false, nocache: true }]
    });
    expect(config.plugins).include('karma-*');
    expect(config.plugins).deep.include({ ['middleware:TestHooksMiddleware']: ['value', TestHooksMiddleware.instance.handler] });
  });

  it('should configure the stryker reporter', () => {
    sut(config);
    expect(config.reporters).include('StrykerReporter');
    expect(config.plugins).include('karma-*');
    expect(config.plugins).deep.include({ ['reporter:StrykerReporter']: ['value', StrykerReporter.instance] });
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
      configFile: path.resolve('../foobar.conf.js')
    });
  });

  it('should allow for custom basePath', () => {
    const expectedBasePath = path.resolve('../baz');
    sut.setGlobals({ karmaConfigFile: '../foobar.conf.js' });
    requireModuleStub.returns((config: Config) => config.set({ basePath: expectedBasePath }));
    sut(config);
    expect(config).deep.include({
      basePath: path.resolve(expectedBasePath),
      configFile: path.resolve('../foobar.conf.js')
    });
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
