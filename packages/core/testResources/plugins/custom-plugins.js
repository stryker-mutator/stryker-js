// @ts-check
import { PluginKind, commonTokens, declareClassPlugin, declareFactoryPlugin, declareValuePlugin } from '@stryker-mutator/api/plugin';
import { DryRunStatus, MutantRunStatus } from '@stryker-mutator/api/test-runner';

/**
 * @typedef {import('@stryker-mutator/api/test-runner').TestRunner} TestRunner 
 * @typedef {import('@stryker-mutator/api/plugin').Injector} Injector
 */

class MyReporter {
  static inject = [commonTokens.logger] /** @type {const} */;

  /** @param {import('@stryker-mutator/api/logging').Logger} logger */
  constructor(logger) {
    this.logger = logger;
  }

  /** @param {Readonly<import('@stryker-mutator/api/core').schema.MutationTestResult>} result */
  onMutationTestReportReady(result) {
    this.logger.info(`${result.files}`);
  }
}

/** 
 * @param {Injector} _injector
 * @returns {TestRunner} 
 */
function createLazyTestRunner(_injector) {
  return {
    capabilities() {
      return { reloadEnvironment: false };
    },

    async dryRun() {
      return {
        status: DryRunStatus.Complete,
        tests: [],
      }
    },
    async mutantRun() {
      return {
        status: MutantRunStatus.Error,
        errorMessage: 'Not implemented',
      }
    }
  };
}
createLazyTestRunner.inject = [commonTokens.injector];

export const strykerPlugins = [
  declareClassPlugin(PluginKind.Reporter, 'console', MyReporter),
  declareFactoryPlugin(PluginKind.TestRunner, 'lazy', createLazyTestRunner),
  declareValuePlugin(PluginKind.Ignore, 'console.debug', {
    shouldIgnore(path) {
      if (
        path.isExpresssionStatement() &&
        path.node.expression.type === 'CallExpression' &&
        path.node.expression.callee.type === 'MemberExpression' &&
        path.node.expression.callee.object.type === 'Identifier' &&
        path.node.expression.callee.object.name === 'console' &&
        path.node.expression.callee.property.type === 'Identifier' &&
        path.node.expression.callee.property.name === 'debug'
      ) {
        return 'ignoring console.debug';
      }
    },
  }),
];
