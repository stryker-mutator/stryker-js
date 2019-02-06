import { TestRunner, RunResult, RunStatus } from 'stryker-api/test_runner';
import { Context } from 'web-component-tester/runner/context';
import { steps } from 'web-component-tester';
import { StrykerOptions } from 'stryker-api/core';
import WctReporter from './WctReporter';
import WctLogger from './WctLogger';
import { getLogger } from 'stryker-api/logging';
const WCT_PACKAGE = 'web-component-tester';
const FORCED_WCT_OPTIONS = Object.freeze({
  persistent: false
});

export function isErrnoException(error: Error): error is NodeJS.ErrnoException {
  return typeof (error as NodeJS.ErrnoException).code === 'string';
}

function errorToString(error: any) {
  if (!error) {
    return '';
  } else if (isErrnoException(error)) {
    return `${error.name}: ${error.code} (${error.syscall}) ${error.stack}`;
  } else if (error instanceof Error) {
    const message = `${error.name}: ${error.message}`;
    if (error.stack) {
      return `${message}\n${error.stack.toString()}`;
    } else {
      return message;
    }
  } else {
    return error.toString();
  }
}
export default class WctTestRunner implements TestRunner {

  private readonly reporter: WctReporter;
  private readonly context: Context;
  private readonly logger: WctLogger;
  private readonly log = getLogger(WctTestRunner.name);

  constructor(runnerOptions: { strykerOptions: StrykerOptions }) {
    if (runnerOptions.strykerOptions.coverageAnalysis !== 'off') {
      throw new Error(`Coverage analysis "${runnerOptions.strykerOptions.coverageAnalysis}" is not (yet) supported by the WCT test runner plugin. Please set \`coverageAnalysis: "off"\` in your stryker.conf.js file.`);
    }
    this.log.debug('Running wct version %s from %s', require(`${WCT_PACKAGE}/package.json`).version, require.resolve(WCT_PACKAGE));
    this.context = this.loadContext(runnerOptions);
    this.logger = new WctLogger(this.context, this.context.options.verbose || false);
    this.reporter = new WctReporter(this.context);
  }

  private loadContext(runnerOptions: { strykerOptions: StrykerOptions }) {
    const context = new Context(Object.assign({}, runnerOptions.strykerOptions.wct, FORCED_WCT_OPTIONS));
    if (this.log.isDebugEnabled()) {
      this.log.debug(`WCT options: %s`, JSON.stringify(this.context.options));
    }
    return context;
  }

  public async init(): Promise<void> {
    try {
      await steps.setupOverrides(this.context);
      await steps.loadPlugins(this.context);
      await steps.configure(this.context);
      await steps.prepare(this.context);
    } catch (error) {
      console.error(errorToString(error));
      throw error;
    }
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
