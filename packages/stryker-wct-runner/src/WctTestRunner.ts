import { StrykerOptions } from 'stryker-api/core';
import { getLogger } from 'stryker-api/logging';
import { RunResult, RunStatus, TestRunner } from 'stryker-api/test_runner';
import { steps } from 'web-component-tester';
import { Context } from 'web-component-tester/runner/context';
import WctLogger from './WctLogger';
import WctReporter from './WctReporter';

const WCT_PACKAGE = 'web-component-tester';
const FORCED_WCT_OPTIONS = Object.freeze({
  persistent: false
});

export default class WctTestRunner implements TestRunner {

  private static ignoreFailedTests(error: Error) {
    if (!error.message.match(/\d+ failed tests?/)) {
      throw error;
    }
  }
  private readonly context: Context;
  private readonly log = getLogger(WctTestRunner.name);
  private readonly logger: WctLogger;

  private readonly reporter: WctReporter;

  constructor(runnerOptions: { strykerOptions: StrykerOptions }) {
    if (runnerOptions.strykerOptions.coverageAnalysis !== 'off') {
      throw new Error(`Coverage analysis "${runnerOptions.strykerOptions.coverageAnalysis}" is not (yet) supported by the WCT test runner plugin. Please set \`coverageAnalysis: "off"\` in your stryker.conf.js file.`);
    }
    this.log.debug('Running wct version %s from %s', require(`${WCT_PACKAGE}/package.json`).version, require.resolve(WCT_PACKAGE));
    this.context = this.loadContext(runnerOptions);
    this.logger = new WctLogger(this.context, this.context.options.verbose || false);
    this.reporter = new WctReporter(this.context);
  }

  public dispose() {
    this.reporter.dispose();
    this.logger.dispose();
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

  private loadContext(runnerOptions: { strykerOptions: StrykerOptions }) {
    const context = new Context({...runnerOptions.strykerOptions.wct, ...FORCED_WCT_OPTIONS});
    if (this.log.isDebugEnabled()) {
      this.log.debug(`WCT options: %s`, JSON.stringify(this.context.options));
    }

    return context;
  }
}
