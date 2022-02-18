import { createRequire } from 'module';

import { Logger } from '@stryker-mutator/api/logging';
import {
  commonTokens,
  Injector,
  PluginContext,
  tokens,
} from '@stryker-mutator/api/plugin';
import {
  determineHitLimitReached,
  DryRunOptions,
  DryRunResult,
  DryRunStatus,
  FailedTestResult,
  MutantRunOptions,
  MutantRunResult,
  TestResult,
  TestRunner,
  TestRunnerCapabilities,
  TestStatus,
  toMutantRunResult,
} from '@stryker-mutator/api/test-runner';
import {
  InstrumenterContext,
  INSTRUMENTER_CONSTANTS,
  StrykerOptions,
} from '@stryker-mutator/api/core';
import { DirectoryRequireCache } from '@stryker-mutator/util';

import { CucumberSetup } from '../src-generated/cucumber-runner-options.js';

import { CucumberRunnerWithStrykerOptions } from './cucumber-runner-with-stryker-options.js';
import { Cli } from './cjs/cucumber-wrapper.js';
import * as pluginTokens from './plugin-tokens.js';

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

const require_ = createRequire(import.meta.url);
const strykerFormatterFile = require_.resolve('./cjs/stryker-formatter');

// Workaround while the StrykerFormatter needs to be a commonjs module
const StrykerFormatter: typeof import('./cjs/stryker-formatter').default =
  require_('./cjs/stryker-formatter.js').default;

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

  public capabilities(): TestRunnerCapabilities {
    return { reloadEnvironment: true };
  }

  public async dryRun(options: DryRunOptions): Promise<DryRunResult> {
    StrykerFormatter.coverageAnalysis = options.coverageAnalysis;
    const result = await this.run(options.disableBail);
    if (
      result.status === DryRunStatus.Complete &&
      options.coverageAnalysis !== 'off'
    ) {
      result.mutantCoverage = this.instrumenterContext.mutantCoverage;
    }
    return result;
  }
  public async mutantRun(options: MutantRunOptions): Promise<MutantRunResult> {
    this.instrumenterContext.activeMutant = options.activeMutant.id;
    this.instrumenterContext.hitLimit = options.hitLimit;
    this.instrumenterContext.hitCount = options.hitLimit ? 0 : undefined;
    return toMutantRunResult(
      await this.run(options.disableBail, options.testFilter)
    );
  }

  private async run(
    disableBail: boolean,
    testFilter?: string[]
  ): Promise<DryRunResult> {
    const testFilterArgs = this.determineFilterArgs(testFilter);
    const tagsArgs = this.determineTagsArgs();
    const profileArgs = this.determineProfileArgs();
    const bailArgs = disableBail ? [] : ['--fail-fast'];
    const argv = [
      'node',
      'cucumber-js',
      '--retry',
      '0',
      '--parallel',
      '0',
      '--format',
      strykerFormatterFile,
      ...bailArgs,
      ...tagsArgs,
      ...profileArgs,
      ...testFilterArgs,
    ];
    const cli = new Cli({
      argv,
      cwd: process.cwd(),
      stdout: process.stdout,
    });
    if (this.logger.isDebugEnabled()) {
      this.logger.debug(
        `${process.cwd()} ${argv.map((arg) => `"${arg}"`).join(' ')}`
      );
    }
    try {
      await cli.run();
    } catch (err: any) {
      return {
        status: DryRunStatus.Error,
        errorMessage: err.stack,
      };
    } finally {
      this.directoryRequireCache.record();
      this.directoryRequireCache.clear();
    }
    const timeoutResult = determineHitLimitReached(
      this.instrumenterContext.hitCount,
      this.instrumenterContext.hitLimit
    );
    if (timeoutResult) {
      return timeoutResult;
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
    };
  }

  private determineProfileArgs(): string[] {
    if (this.options.profile) {
      return ['--profile', this.options.profile];
    }
    return [];
  }
  private determineTagsArgs(): string[] {
    if (this.options.tags) {
      return this.options.tags.flatMap((tag) => ['--tags', tag]);
    }
    return [];
  }

  private determineFilterArgs(testFilter: string[] | undefined) {
    if (testFilter) {
      return Object.entries(
        testFilter?.reduce<Record<string, string[]>>((acc, testId) => {
          const [fileName, lineNumber] = testId.split(':');
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const lines = acc[fileName] ?? (acc[fileName] = []);
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          lines.push(lineNumber);
          return acc;
        }, {})
      ).map(([fileName, lines]) => [fileName, ...lines].join(':'));
    } else if (this.options.features) {
      return this.options.features;
    } else {
      return [];
    }
  }
}
function hasFailed(test: TestResult): test is FailedTestResult {
  return test.status === TestStatus.Failed;
}
