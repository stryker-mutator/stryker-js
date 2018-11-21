import { TestRunner, RunResult, RunnerOptions, RunStatus } from 'stryker-api/test_runner';
import { Context } from 'web-component-tester/runner/context';
import * as steps from 'web-component-tester/runner/steps';
import { Config as WctConfig } from 'web-component-tester/runner/config';

export default class WctTestRunner implements TestRunner {

  private wctOptions: WctConfig;

  constructor(runnerOptions: RunnerOptions) {
    this.wctOptions = runnerOptions.strykerOptions.wctOptions;
  }

  public async run(): Promise<RunResult> {
    const context = new Context(this.wctOptions);

    // We assume that any options related to logging are passed in via the initial
    // `options`.
    // if (context.options.output) {
    //   new CliReporter(context, context.options.output, context.options);
    // }

    await steps.setupOverrides(context);
    await steps.loadPlugins(context);
    await steps.configure(context);
    await steps.prepare(context);
    await steps.runTests(context);
    return { status: RunStatus.Complete, tests: [] };
  }
}
