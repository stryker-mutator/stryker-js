import { TestRunner, RunResult, RunStatus } from 'stryker-api/test_runner';
import { Context } from 'web-component-tester/runner/context';
import * as steps from 'web-component-tester/runner/steps';
import { Config as WctConfig } from 'web-component-tester/runner/config';
import { StrykerOptions } from 'stryker-api/core';
import WctReporter from './WctReporter';

export default class WctTestRunner implements TestRunner {

  private readonly wctOptions: WctConfig;
  private readonly reporter: WctReporter;
  private readonly context: Context;

  constructor(runnerOptions: { strykerOptions: StrykerOptions }) {
    this.wctOptions = (runnerOptions.strykerOptions.wct || {}).options;
    this.context = new Context(this.wctOptions);
    this.reporter = new WctReporter(this.context);
    this.ignoreFailedTests = this.ignoreFailedTests.bind(this);
  }

  public async run(): Promise<RunResult> {
    await steps.setupOverrides(this.context);
    await steps.loadPlugins(this.context);
    await steps.configure(this.context);
    await steps.prepare(this.context);
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
