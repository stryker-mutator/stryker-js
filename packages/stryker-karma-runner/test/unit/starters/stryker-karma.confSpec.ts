import * as path from 'path';
import * as log4js from 'log4js';
import sut = require('../../../src/starters/stryker-karma.conf');
import { Config, ConfigOptions } from 'karma';
import { expect } from 'chai';
import LoggerStub from '../../helpers/LoggerStub';
import * as utils from '../../../src/utils';
import TestHooksMiddleware, { TEST_HOOKS_FILE_NAME } from '../../../src/TestHooksMiddleware';
import StrykerReporter from '../../../src/StrykerReporter';

describe('stryker-karma.conf.js', () => {

  let logMock: LoggerStub;
  let requireModuleStub: sinon.SinonStub;
  let config: Config;

  beforeEach(() => {
    config = new KarmaConfigMock();
    logMock = new LoggerStub();
    sandbox.stub(log4js, 'getLogger').returns(logMock);
    requireModuleStub = sandbox.stub(utils, 'requireModule');
  });

  afterEach(() => {
    sut.setGlobals({});
  });

  it('should create the correct logger', () => {
    sut(config);
    expect(log4js.getLogger).calledWith('stryker-karma.conf.js');
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
    requireModuleStub.returns((conf: Config) => conf.set({
      basePath: 'foobar'
    }));
    sut.setGlobals({ karmaConfigFile: 'foobar.conf.js' });

    // Act
    sut(config);

    // Assert
    expect(config).deep.include({ basePath: 'foobar' });
    expect(requireModuleStub).calledWith(path.resolve('foobar.conf.js'));
  });

  it('should set user configuration from custom karma config', () => {
    sut.setGlobals({ karmaConfig: { basePath: 'foobar' } });
    sut(config);
    expect(config).deep.include({ basePath: 'foobar' });
  });

  it('should force some options that relate to karma\'s life cycle', () => {
    config.set({ browserNoActivityTimeout: 1, autoWatch: true, singleRun: true, detached: true });
    sut(config);
    expect(config).deep.include({
      browserNoActivityTimeout: 1000000,
      autoWatch: false,
      singleRun: false,
      detached: false
    });
  });

  it('should set the port', () => {
    sut.setGlobals({ port: 1337 });
    sut(config);
    expect(config).include({ port: 1337 });
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
    requireModuleStub.returns((config: Config) => { /* noop */ });
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
  set(config: ConfigOptions) {
    for (let prop in config) {
      if (prop !== 'set') {
        (this as any)[prop] = (config as any)[prop];
      }
    }
  }
  LOG_DISABLE = 'off';
  LOG_ERROR = 'error';
  LOG_WARN = 'warn';
  LOG_INFO = 'info';
  LOG_DEBUG = 'debug';
}