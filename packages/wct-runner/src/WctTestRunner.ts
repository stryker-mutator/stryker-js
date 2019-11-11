import { StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { RunResult, RunStatus, TestRunner } from '@stryker-mutator/api/test_runner';
import { steps } from 'web-component-tester';
import { Context } from 'web-component-tester/runner/context';

import WctLogger from './WctLogger';
import WctReporter from './WctReporter';

const WCT_PACKAGE = 'web-component-tester';
const FORCED_WCT_OPTIONS = Object.freeze({
  persistent: false
});

export default class WctTestRunner implements TestRunner {
  private readonly reporter: WctReporter;
  private readonly context: Context;
  private readonly logger: WctLogger;

  public static inject = tokens(commonTokens.logger, commonTokens.options);
  constructor(private readonly log: Logger, options: StrykerOptions) {
    if (options.coverageAnalysis !== 'off') {
      throw new Error(
        `Coverage analysis "${options.coverageAnalysis}" is not (yet) supported by the WCT test runner plugin. Please set \`coverageAnalysis: "off"\` in your stryker.conf.js file.`
      );
    }
    this.log.debug('Running wct version %s from %s', require(`${WCT_PACKAGE}/package.json`).version, require.resolve(WCT_PACKAGE));
    this.context = this.loadContext(options);
    this.logger = new WctLogger(this.context, this.context.options.verbose || false, this.log);
    this.reporter = new WctReporter(this.context);
  }

  private loadContext(options: StrykerOptions) {
    const context = new Context(Object.assign({}, options.wct, FORCED_WCT_OPTIONS));
    if (this.log.isDebugEnabled()) {
      this.log.debug('WCT options: %s', JSON.stringify(this.context.options));
    }
    return context;
  }

  public async init(): Promise<void> {
    await steps.setupOverrides(this.context);
    await steps.loadPlugins(this.context);
    await steps.configure(this.context);
    await steps.prepare(this.context);
  }

  public async run(): Promise<RunResult> {
    this.reporter.results = [];
    try {
      await steps.runTests(this.context).catch(WctTestRunner.ignoreFailedTests);
      return {
        status: RunStatus.Complete,
        tests: this.reporter.results
      };
    } catch (error) {
      return {
        errorMessages: [error.stack],
        status: RunStatus.Error,
        tests: []
      };
    }
  }

  public dispose() {
    this.reporter.dispose();
    this.logger.dispose();
  }

  private static ignoreFailedTests(error: Error) {
    if (!/\d+ failed tests?/.exec(error.message)) {
      throw error;
    }
  }
}
