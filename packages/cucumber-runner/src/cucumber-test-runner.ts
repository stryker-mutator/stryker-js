import { Logger } from '@stryker-mutator/api/logging';
import {
  commonTokens,
  Injector,
  PluginContext,
  tokens,
} from '@stryker-mutator/api/plugin';
import {
  DryRunOptions,
  DryRunResult,
  DryRunStatus,
  FailedTestResult,
  MutantRunOptions,
  MutantRunResult,
  TestResult,
  TestRunner,
  TestStatus,
  toMutantRunResult,
} from '@stryker-mutator/api/test-runner';
import {
  InstrumenterContext,
  INSTRUMENTER_CONSTANTS,
  StrykerOptions,
} from '@stryker-mutator/api/core';
import { DirectoryRequireCache } from '@stryker-mutator/util';

import { CucumberSetup } from '../src-generated/cucumber-runner-options';

import { CucumberRunnerWithStrykerOptions } from './cucumber-runner-with-stryker-options';
import { Cli } from './cucumber-wrapper';
import StrykerFormatter from './stryker-formatter';
import * as pluginTokens from './plugin-tokens';

cucumberTestRunnerFactory.inject = [commonTokens.injector];
export function cucumberTestRunnerFactory(
  injector: Injector<PluginContext>
): CucumberTestRunner {
  return injector
    .provideValue(
      pluginTokens.globalNamespace,
      INSTRUMENTER_CONSTANTS.NAMESPACE
    )
    .injectClass(CucumberTestRunner);
}

export class CucumberTestRunner implements TestRunner {
  public static inject = tokens(
    commonTokens.logger,
    commonTokens.options,
    pluginTokens.globalNamespace
  );

  private readonly options: CucumberSetup;
  private readonly instrumenterContext: InstrumenterContext;

  constructor(
    private readonly logger: Logger,
    options: StrykerOptions,
    globalNamespace: typeof INSTRUMENTER_CONSTANTS.NAMESPACE | '__stryker2__'
  ) {
    this.options = (options as CucumberRunnerWithStrykerOptions).cucumber;
    this.instrumenterContext =
      global[globalNamespace] ?? (global[globalNamespace] = {});
    StrykerFormatter.instrumenterContext = this.instrumenterContext;
  }

  private readonly directoryRequireCache = new DirectoryRequireCache();

  public dryRun(options: DryRunOptions): Promise<DryRunResult> {
    StrykerFormatter.coverageAnalysis = options.coverageAnalysis;
    return this.run();
  }
  public async mutantRun(options: MutantRunOptions): Promise<MutantRunResult> {
    this.instrumenterContext.activeMutant = options.activeMutant.id;
    return toMutantRunResult(await this.run(options.testFilter));
  }

  private async run(testFilter?: string[]): Promise<DryRunResult> {
    let testFilterArgs: string[] = [];
    if (testFilter) {
      testFilterArgs = Object.entries(
        testFilter?.reduce<Record<string, string[]>>((acc, testId) => {
          const [fileName, lineNumber] = testId.split(':');
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const lines = acc[fileName] ?? (acc[fileName] = []);
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          lines.push(lineNumber);
          return acc;
        }, {})
      ).map(([fileName, lines]) => [fileName, ...lines].join(':'));
    }
    const argv = [
      'node',
      'cucumber-js',
      '--fail-fast',
      '--retry',
      '0',
      '--parallel',
      '0',
      '--format',
      require.resolve('./stryker-formatter'),
      ...(this.options.tags ? ['--tags', this.options.tags] : []),
      ...testFilterArgs,
    ];
    const cli = new Cli({
      argv,
      cwd: process.cwd(),
      stdout: process.stdout,
    });
    if (this.logger.isTraceEnabled()) {
      this.logger.trace(argv.map((arg) => `"${arg}"`).join(' '));
    }
    try {
      await cli.run();
    } catch (err) {
      return {
        status: DryRunStatus.Error,
        errorMessage: err.stack,
      };
    } finally {
      this.directoryRequireCache.record();
      this.directoryRequireCache.clear();
    }
    const tests = StrykerFormatter.instance!.reportedTestResults;
    const failedTest: FailedTestResult | undefined = tests.find(hasFailed);
    if (failedTest?.failureMessage.startsWith('TypeError:')) {
      return {
        status: DryRunStatus.Error,
        errorMessage: failedTest.failureMessage,
      };
    }
    return {
      status: DryRunStatus.Complete,
      tests: StrykerFormatter.instance!.reportedTestResults,
      mutantCoverage: this.instrumenterContext.mutantCoverage,
    };
  }
}
function hasFailed(test: TestResult): test is FailedTestResult {
  return test.status === TestStatus.Failed;
}
