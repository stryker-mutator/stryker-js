import path from 'path';

import { fileURLToPath } from 'url';

import { Logger, LoggerFactoryMethod } from '@stryker-mutator/api/logging';
import type {
  Config,
  ConfigOptions,
  ClientOptions,
  InlinePluginType,
} from 'karma';
import { noopLogger, requireResolve } from '@stryker-mutator/util';

import { StrykerReporter, strykerReporterFactory } from './stryker-reporter.js';
import {
  TestHooksMiddleware,
  TEST_HOOKS_FILE_NAME,
} from './test-hooks-middleware.js';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export const strykerKarmaConfigPath = path.resolve(
  path.dirname(filename),
  '..' /* karma-plugins */,
  '..' /* src */,
  '..' /* dist */,
  'stryker-karma.conf.cjs',
);

function setDefaultOptions(config: Config) {
  config.set({
    browsers: ['ChromeHeadless'],
    frameworks: ['jasmine'],
  });
}

async function setUserKarmaConfigFile(
  config: Config,
  log: Logger,
  requireFromCwd: typeof requireResolve,
) {
  if (globalSettings.karmaConfigFile) {
    const configFileName = path.resolve(globalSettings.karmaConfigFile);
    log.debug('Importing config from "%s"', configFileName);
    try {
      const userConfig = requireFromCwd(configFileName);
      if (typeof userConfig !== 'function') {
        throw new TypeError(
          `Karma config file "${configFileName}" should export a function! Found: ${typeof userConfig}`,
        );
      }
      await userConfig(config);
      config.configFile = configFileName; // override config to ensure karma is as user-like as possible
    } catch (error: any) {
      if (error.code === 'MODULE_NOT_FOUND') {
        log.error(
          `Unable to find karma config at "${globalSettings.karmaConfigFile}" (tried to load from ${configFileName}). Please check your stryker config. You might need to make sure the file is included in the sandbox directory.`,
        );
      } else {
        throw error; // oops
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
    singleRun: false,
  });
}

/**
 * Sets configuration that is needed to control client scripts in karma.
 * @param config The config to use
 * @see https://github.com/stryker-mutator/stryker-js/issues/2049
 */
function setClientOptions(config: Config) {
  // Disable clearContext because of issue #2049 (race condition in Karma)
  // Enabling clearContext (default true) will load "about:blank" in the iFrame after a test run.
  // As far as I can see clearing the context only has a visible effect (you don't see the result of the last test).
  // If this is true, disabling it is safe to do and solves the race condition issue.
  const clientOptions: Partial<ClientOptions> = { clearContext: false };

  // Disable randomized tests with using jasmine. Stryker doesn't play nice with a random test order, since spec id's tent to move around
  // Also set failFast, so that we're not waiting on more than 1 failed test
  if (config.frameworks?.includes('jasmine')) {
    (clientOptions as any).jasmine = {
      random: false,

      // Jasmine@<4
      failFast: !globalSettings.disableBail,
      oneFailurePerSpec: !globalSettings.disableBail,

      // Jasmine@4
      stopOnSpecFailure: !globalSettings.disableBail,
      stopSpecOnExpectationFailure: !globalSettings.disableBail,
    };
  }

  if (config.frameworks?.includes('mocha')) {
    (clientOptions as any).mocha = { bail: !globalSettings.disableBail };
  }
  config.set({ client: clientOptions });
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
      config.basePath = path.resolve(
        path.dirname(globalSettings.karmaConfigFile),
      );
    } else {
      config.basePath = process.cwd();
    }
  }
}

function addPlugin(
  karmaConfig: ConfigOptions,
  karmaPlugin: Record<string, InlinePluginType> | string,
) {
  karmaConfig.plugins = karmaConfig.plugins ?? ['karma-*'];
  karmaConfig.plugins.push(karmaPlugin);
}

/**
 * Configures the test hooks middleware.
 * It adds a non-existing file to the top `files` array.
 * Further more it configures a middleware that serves the file.
 */
function configureTestHooksMiddleware(config: Config) {
  // Add test run middleware file
  config.files = config.files ?? [];

  config.files.unshift({
    pattern: TEST_HOOKS_FILE_NAME,
    included: true,
    watched: false,
    served: false,
    nocache: true,
  }); // Add a custom hooks file to provide hooks
  const middleware: string[] =
    config.beforeMiddleware ?? (config.beforeMiddleware = []);
  middleware.unshift(TestHooksMiddleware.name);

  TestHooksMiddleware.instance.configureTestFramework(config.frameworks);

  addPlugin(config, {
    [`middleware:${TestHooksMiddleware.name}`]: [
      'value',
      TestHooksMiddleware.instance.handler,
    ],
  });
}

function configureStrykerMutantCoverageAdapter(config: Config) {
  config.files = config.files ?? [];
  config.files.unshift({
    pattern: path.resolve(dirname, 'stryker-mutant-coverage-adapter.js'),
    included: true,
    watched: false,
    served: true,
    nocache: true,
    type: 'module',
  });
}

function configureStrykerReporter(config: Config) {
  addPlugin(config, {
    [`reporter:${StrykerReporter.name}`]: ['factory', strykerReporterFactory],
  });
  if (!config.reporters) {
    config.reporters = [];
  }
  config.reporters.push(StrykerReporter.name);
}

interface GlobalSettings {
  karmaConfig?: ConfigOptions;
  karmaConfigFile?: string;
  getLogger: LoggerFactoryMethod;
  disableBail: boolean;
}

const globalSettings: GlobalSettings = {
  getLogger() {
    return noopLogger;
  },
  disableBail: false,
};

export async function configureKarma(
  config: Config,
  requireFromCwd = requireResolve,
): Promise<void> {
  const log = globalSettings.getLogger(path.basename(filename));
  setDefaultOptions(config);
  await setUserKarmaConfigFile(config, log, requireFromCwd);
  setUserKarmaConfig(config);
  setBasePath(config);
  setLifeCycleOptions(config);
  setClientOptions(config);
  configureTestHooksMiddleware(config);
  configureStrykerMutantCoverageAdapter(config);
  configureStrykerReporter(config);
}

/**
 * Provide global settings for next configuration
 * This is the only way we can pass through any values between the `KarmaTestRunner` and the stryker-karma.conf file.
 * (not counting environment variables)
 */
configureKarma.setGlobals = (globals: Partial<GlobalSettings>) => {
  globalSettings.karmaConfig = globals.karmaConfig;
  globalSettings.karmaConfigFile = globals.karmaConfigFile;
  globalSettings.getLogger = globals.getLogger ?? (() => noopLogger);
  globalSettings.disableBail = globals.disableBail ?? false;
};
