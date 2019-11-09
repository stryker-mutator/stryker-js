import { Logger, LoggerFactoryMethod } from '@stryker-mutator/api/logging';
import { Config, ConfigOptions } from 'karma';
import * as path from 'path';
import StrykerReporter from '../StrykerReporter';
import TestHooksMiddleware, { TEST_HOOKS_FILE_NAME } from '../TestHooksMiddleware';
import { requireModule } from '../utils';

function setDefaultOptions(config: Config) {
  config.set({
    browsers: ['PhantomJS'],
    frameworks: ['jasmine']
  });
}

function setUserKarmaConfigFile(config: Config, log: Logger) {
  if (globalSettings.karmaConfigFile && typeof globalSettings.karmaConfigFile === 'string') {
    const configFileName = path.resolve(globalSettings.karmaConfigFile);
    log.debug('Importing config from "%s"', configFileName);
    try {
      const userConfig = requireModule(configFileName);
      userConfig(config);
      config.configFile = configFileName; // override config to ensure karma is as user-like as possible
    } catch (error) {
      if (error.code === 'MODULE_NOT_FOUND') {
        log.error(
          `Unable to find karma config at "${globalSettings.karmaConfigFile}" (tried to load from ${configFileName}). Please check your stryker config. You might need to make sure the file is included in the sandbox directory.`
        );
      } else {
        log.error(`Could not read karma configuration from ${globalSettings.karmaConfigFile}.`, error);
      }
    }
  }
}

/**
 * Sets configuration that is needed to control the karma life cycle. Namely it shouldn't watch files and not quit after first test run.
 * @param config The config to use
 */
function setLifeCycleOptions(config: Config) {
  config.set({
    // No auto watch, stryker will inform us when we need to test
    autoWatch: false,
    // Override browserNoActivityTimeout. Default value 10000 might not enough to send perTest coverage results
    browserNoActivityTimeout: 1000000,
    // Never detach, always run in this same process (is already a separate process)
    detached: false,
    // Don't stop after first run
    singleRun: false
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

const noopLogger = {
  isTraceEnabled() {
    return false;
  },
  isDebugEnabled() {
    return false;
  },
  isInfoEnabled() {
    return false;
  },
  isWarnEnabled() {
    return false;
  },
  isErrorEnabled() {
    return false;
  },
  isFatalEnabled() {
    return false;
  },
  trace() {
    // noop
  },
  debug() {
    // noop
  },
  info() {
    // noop
  },
  warn() {
    // noop
  },
  error() {
    // noop
  },
  fatal() {
    // noop
  }
};

const globalSettings: {
  karmaConfig?: ConfigOptions;
  karmaConfigFile?: string;
  getLogger: LoggerFactoryMethod;
} = {
  getLogger() {
    return noopLogger;
  }
};

export = Object.assign(
  (config: Config) => {
    const log = globalSettings.getLogger(path.basename(__filename));
    setDefaultOptions(config);
    setUserKarmaConfigFile(config, log);
    setUserKarmaConfig(config);
    setBasePath(config);
    setLifeCycleOptions(config);
    configureTestHooksMiddleware(config);
    configureStrykerReporter(config);
  },
  {
    /**
     * Provide global settings for next configuration
     * This is the only way we can pass through any values between the `KarmaTestRunner` and the stryker-karma.conf file.
     * (not counting environment variables)
     */
    setGlobals(globals: { karmaConfig?: ConfigOptions; karmaConfigFile?: string; getLogger?: LoggerFactoryMethod }) {
      globalSettings.karmaConfig = globals.karmaConfig;
      globalSettings.karmaConfigFile = globals.karmaConfigFile;
      globalSettings.getLogger = globals.getLogger || (() => noopLogger);
    }
  }
);
