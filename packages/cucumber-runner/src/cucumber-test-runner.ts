import fs from 'fs';

import { fileURLToPath } from 'url';

import semver from 'semver';
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
import type {
  IConfiguration,
  IRunOptions,
  ISupportCodeCoordinatesOrLibrary,
  ISourcesCoordinates,
} from '@cucumber/cucumber/api';

import { CucumberSetup } from '../src-generated/cucumber-runner-options.js';

import { CucumberRunnerWithStrykerOptions } from './cucumber-runner-with-stryker-options.js';
import {
  runCucumber,
  loadConfiguration,
  version as cucumberVersion,
} from './cucumber-wrapper.cjs';
import * as pluginTokens from './plugin-tokens.js';
import strykerFormatterModule from './stryker-formatter.cjs';

type ISupportCodeLibrary = Exclude<
  ISupportCodeCoordinatesOrLibrary,
  ISourcesCoordinates
>;

cucumberTestRunnerFactory.inject = [commonTokens.injector];
export function cucumberTestRunnerFactory(
  injector: Injector<PluginContext>,
): CucumberTestRunner {
  return injector
    .provideValue(
      pluginTokens.globalNamespace,
      INSTRUMENTER_CONSTANTS.NAMESPACE,
    )
    .injectClass(CucumberTestRunner);
}

const StrykerFormatter = strykerFormatterModule.default;
const strykerFormatterFile = new URL(
  './stryker-formatter.cjs',
  import.meta.url,
);

interface ResolvedConfiguration {
  /**
   * The final flat configuration object resolved from the configuration file/profiles plus any extra provided.
   */
  useConfiguration: IConfiguration;
  /**
   * The format that can be passed into `runCucumber`.
   */
  runConfiguration: IRunOptions;
}

export class CucumberTestRunner implements TestRunner {
  public static inject = tokens(
    commonTokens.logger,
    commonTokens.options,
    pluginTokens.globalNamespace,
  );

  private supportCodeLibrary?: ISupportCodeLibrary;
  private readonly options: CucumberSetup;
  private readonly instrumenterContext: InstrumenterContext;

  constructor(
    private readonly logger: Logger,
    options: StrykerOptions,
    globalNamespace: typeof INSTRUMENTER_CONSTANTS.NAMESPACE | '__stryker2__',
  ) {
    guardForCucumberJSVersion();
    this.options = (options as CucumberRunnerWithStrykerOptions).cucumber;
    this.instrumenterContext =
      global[globalNamespace] ?? (global[globalNamespace] = {});
    StrykerFormatter.instrumenterContext = this.instrumenterContext;
  }

  public capabilities(): TestRunnerCapabilities {
    return { reloadEnvironment: false };
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
      await this.run(options.disableBail, options.testFilter),
    );
  }

  private async run(
    disableBail: boolean,
    testFilter?: string[],
  ): Promise<DryRunResult> {
    const href = semver.satisfies(cucumberVersion, '>=10')
      ? strykerFormatterFile.href
      : fileURLToPath(strykerFormatterFile.href);
    const { runConfiguration, useConfiguration }: ResolvedConfiguration =
      await loadConfiguration({
        provided: {
          format: [href],
          retry: 0,
          parallel: 0,
          failFast: !disableBail,
          tags: this.options.tags?.map((tag) => `(${tag})`).join(' and '),
        },
        profiles: this.options.profile ? [this.options.profile] : undefined,
      });
    const config: IRunOptions = runConfiguration;

    // Override the tests to run. Don't provide these above in provide, as that will merge all together
    config.sources.paths = this.determinePaths(
      testFilter,
      config.sources.paths,
    );

    if (this.logger.isDebugEnabled()) {
      this.logger.debug(
        `Running cucumber with configuration: (${process.cwd()})\n${JSON.stringify(
          useConfiguration,
          null,
          2,
        )}`,
      );
    }
    if (this.supportCodeLibrary) {
      config.support = this.supportCodeLibrary;
    }
    try {
      this.supportCodeLibrary = (await runCucumber(config)).support;
    } catch (err: any) {
      return {
        status: DryRunStatus.Error,
        errorMessage: err.stack,
      };
    }
    const timeoutResult = determineHitLimitReached(
      this.instrumenterContext.hitCount,
      this.instrumenterContext.hitLimit,
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

  private determinePaths(
    testFilter: string[] | undefined,
    defaultPaths: string[],
  ): string[] {
    if (testFilter) {
      return Object.entries(
        testFilter?.reduce<Record<string, string[]>>((acc, testId) => {
          const [fileName, lineNumber] = testId.split(':');

          const lines = acc[fileName] ?? (acc[fileName] = []);

          lines.push(lineNumber);
          return acc;
        }, {}),
      ).map(([fileName, lines]) => [fileName, ...lines].join(':'));
    } else if (this.options.features) {
      return this.options.features;
    } else {
      return defaultPaths;
    }
  }
}
function hasFailed(test: TestResult): test is FailedTestResult {
  return test.status === TestStatus.Failed;
}

const pkg: { peerDependencies: { '@cucumber/cucumber': string } } = JSON.parse(
  fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf-8'),
);

export function guardForCucumberJSVersion(version = cucumberVersion): void {
  if (!semver.satisfies(version, pkg.peerDependencies['@cucumber/cucumber'])) {
    throw new Error(
      `@stryker-mutator/cucumber-runner only supports @cucumber/cucumber@${pkg.peerDependencies['@cucumber/cucumber']}. Found v${version}`,
    );
  }
}
