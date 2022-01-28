// @ts-check
const { declareClassPlugin, PluginKind, tokens, commonTokens } = require('@stryker-mutator/api/plugin');
const { DryRunStatus } = require('@stryker-mutator/api/test-runner');

module.exports.strykerPlugins = [
  declareClassPlugin(
    PluginKind.TestRunner,
    'custom',
    class CustomTestRunner {
      static inject = tokens(commonTokens.logger);

      /**
       *
       * @param {import('@stryker-mutator/api/logging').Logger} logger
       */
      constructor(logger) {
        this.logger = logger;
      }

      /**
       * @returns {import('@stryker-mutator/api/test-runner').TestRunnerCapabilities}
       */
      capabilities() {
        return { reloadEnvironment: true };
      }
      /**
       * @param {import('@stryker-mutator/api/test-runner').DryRunOptions} options
       * @returns {Promise<import('@stryker-mutator/api/test-runner').DryRunResult>}
       */
      async dryRun(options) {
        if (this.logger.isTraceEnabled()) {
          this.logger.trace('trace %s', JSON.stringify(options));
        }
        this.logger.debug('test debug');
        this.logger.info('test info');
        this.logger.warn('test warn');
        this.logger.error('test error');
        return { status: DryRunStatus.Complete, tests: [] };
      }

      /**
       * @returns {Promise<import('@stryker-mutator/api/test-runner').MutantRunResult>}
       */
      mutantRun() {
        throw new Error('Not implemented');
      }
    }
  ),
];
