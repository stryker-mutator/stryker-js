import { Config, ConfigOptions } from 'karma';
import * as path from 'path';
import { requireModule } from '../utils';
import TestHooksMiddleware, { TEST_HOOKS_FILE_NAME } from '../TestHooksMiddleware';
import StrykerReporter from '../StrykerReporter';
import { getLogger, Logger } from 'log4js';

function setDefaultOptions(config: Config) {
  config.set({
    browsers: ['PhantomJS'],
    frameworks: ['jasmine']
  });
}

function setUserKarmaConfigFile(config: Config, log: Logger) {
  if (globalSettings.karmaConfigFile && typeof globalSettings.karmaConfigFile === 'string') {
    const configFileName = path.resolve(globalSettings.karmaConfigFile);
    log.info('Importing config from "%s"', configFileName);
    try {
      const userConfig = requireModule(configFileName);
      userConfig(config);
      config.configFile = configFileName; // override config to ensure karma is as user-like as possible
    } catch (error) {
      log.error(`Could not read karma configuration from ${globalSettings.karmaConfigFile}.`, error);
    }
  }
}

/**
 * Sets configuration that is needed to control the karma life cycle. Namely it shouldn't watch files and not quit after first test run.
 * @param config The config to use
 */
function setLifeCycleOptions(config: Config) {
  config.set({
    // Override browserNoActivityTimeout. Default value 10000 might not enough to send perTest coverage results
    browserNoActivityTimeout: 1000000,
    // No auto watch, stryker will inform us when we need to test
    autoWatch: false,
    // Don't stop after first run
    singleRun: false,
    // Never detach, always run in this same process (is already a separate process)
    detached: false
  });
}

function setPort(config: Config) {
  config.set({
    port: globalSettings.port
  });
}

function setUserKarmaConfig(config: Config) {
  if (globalSettings.karmaConfig) {
    config.set(globalSettings.karmaConfig);
  }
}

function setBasePath(config: Config) {
  if (!config.basePath) {
    // We need to set the base path, so karma won't use this file to base everything of
    if (globalSettings.karmaConfigFile) {
      config.basePath = path.resolve(path.dirname(globalSettings.karmaConfigFile));
    } else {
      config.basePath = process.cwd();
    }
  }
}

function addPlugin(karmaConfig: ConfigOptions, karmaPlugin: any) {
  karmaConfig.plugins = karmaConfig.plugins || ['karma-*'];
  karmaConfig.plugins.push(karmaPlugin);
}


/**
 * Configures the test hooks middleware. 
 * It adds a non-existing file to the top `files` array. 
 * Further more it configures a middleware that serves the file.
 */
function configureTestHooksMiddleware(config: Config) {
  // Add test run middleware file
  config.files = config.files || [];

  config.files.unshift({ pattern: TEST_HOOKS_FILE_NAME, included: true, watched: false, served: false, nocache: true }); // Add a custom hooks file to provide hooks
  const middleware: string[] = (config as any).middleware || ((config as any).middleware = []);
  middleware.unshift(TestHooksMiddleware.name);
  addPlugin(config, { [`middleware:${TestHooksMiddleware.name}`]: ['value', TestHooksMiddleware.instance.handler] });
}

function configureStrykerReporter(config: Config) {
  addPlugin(config, { [`reporter:${StrykerReporter.name}`]: ['value', StrykerReporter.instance] });
  if (!config.reporters) {
    config.reporters = [];
  }
  config.reporters.push(StrykerReporter.name);
}

const globalSettings: {
  port?: number;
  karmaConfig?: ConfigOptions;
  karmaConfigFile?: string;
} = {};

export = Object.assign((config: Config) => {
  const log = getLogger(path.basename(__filename));
  setDefaultOptions(config);
  setUserKarmaConfigFile(config, log);
  setUserKarmaConfig(config);
  setBasePath(config);
  setLifeCycleOptions(config);
  setPort(config);
  configureTestHooksMiddleware(config);
  configureStrykerReporter(config);
}, {
    /**
     * Provide global settings for next configuration
     * This is the only way we can pass through any values between the `KarmaTestRunner` and the stryker-karma.conf file.
     * (not counting environment variables)
    */
    setGlobals(globals: { port?: number; karmaConfig?: ConfigOptions; karmaConfigFile?: string; }) {
      globalSettings.port = globals.port;
      globalSettings.karmaConfig = globals.karmaConfig;
      globalSettings.karmaConfigFile = globals.karmaConfigFile;
    }
  });
