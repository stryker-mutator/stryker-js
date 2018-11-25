import { TestRunner, RunResult, RunStatus } from 'stryker-api/test_runner';
import { Context } from 'web-component-tester/runner/context';
import * as steps from 'web-component-tester/runner/steps';
import { StrykerOptions } from 'stryker-api/core';
import WctReporter from './WctReporter';
import WctLogger from './WctLogger';

export default class WctTestRunner implements TestRunner {

  private readonly reporter: WctReporter;
  private readonly context: Context;

  constructor(runnerOptions: { strykerOptions: StrykerOptions }) {
    this.context = new Context(runnerOptions.strykerOptions.wct);
    new WctLogger(this.context);
    this.reporter = new WctReporter(this.context);
    this.ignoreFailedTests = this.ignoreFailedTests.bind(this);
  }

  public async init(): Promise<void> {
    await steps.setupOverrides(this.context);
    await steps.loadPlugins(this.context);
    await steps.configure(this.context);
    await steps.prepare(this.context);
  }

  public async run(): Promise<RunResult> {
    this.reporter.results = [];
    await steps.runTests(this.context).catch(this.ignoreFailedTests);
    return {
      status: RunStatus.Complete,
      tests: this.reporter.results
    };
  }

  private async ignoreFailedTests(error: Error) {
    if (!error.message.match(/\d+ failed tests?/)) {
      throw error;
    }
  }
}
