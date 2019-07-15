import { TestRunner, RunResult, RunStatus } from '@stryker-mutator/api/test_runner';
import { Context } from 'web-component-tester/runner/context';
import { steps } from 'web-component-tester';
import { StrykerOptions } from '@stryker-mutator/api/core';
import WctReporter from './WctReporter';
import WctLogger from './WctLogger';
import { Logger } from '@stryker-mutator/api/logging';
import { tokens, COMMON_TOKENS } from '@stryker-mutator/api/plugin';

const wctPackage = 'web-component-tester';
const forcedWctOptions = Object.freeze({
  persistent: false
});

export default class WctTestRunner implements TestRunner {

  private readonly reporter: WctReporter;
  private readonly context: Context;
  private readonly logger: WctLogger;

  public static inject = tokens(COMMON_TOKENS.logger, COMMON_TOKENS.options);
  constructor(private readonly log: Logger, options: StrykerOptions) {
    if (options.coverageAnalysis !== 'off') {
      throw new Error(`Coverage analysis "${options.coverageAnalysis}" is not (yet) supported by the WCT test runner plugin. Please set \`coverageAnalysis: "off"\` in your stryker.conf.js file.`);
    }
    this.log.debug('Running wct version %s from %s', require(`${wctPackage}/package.json`).version, require.resolve(wctPackage));
    this.context = this.loadContext(options);
    this.logger = new WctLogger(this.context, this.context.options.verbose || false, this.log);
    this.reporter = new WctReporter(this.context);
  }

  private loadContext(options: StrykerOptions) {
    const context = new Context(Object.assign({}, options.wct, forcedWctOptions));
    if (this.log.isDebugEnabled()) {
      this.log.debug(`WCT options: %s`, JSON.stringify(this.context.options));
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
    if (!error.message.match(/\d+ failed tests?/)) {
      throw error;
    }
  }
}
