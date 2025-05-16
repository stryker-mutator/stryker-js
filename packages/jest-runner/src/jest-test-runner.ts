import path from 'path';
import { createRequire } from 'module';

import {
  StrykerOptions,
  INSTRUMENTER_CONSTANTS,
  CoverageAnalysis,
} from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import {
  commonTokens,
  Injector,
  PluginContext,
  tokens,
} from '@stryker-mutator/api/plugin';
import {
  TestRunner,
  MutantRunOptions,
  DryRunResult,
  MutantRunResult,
  toMutantRunResult,
  DryRunStatus,
  TestResult,
  TestStatus,
  DryRunOptions,
  BaseTestResult,
  TestRunnerCapabilities,
  determineHitLimitReached,
} from '@stryker-mutator/api/test-runner';
import { escapeRegExp, notEmpty, requireResolve } from '@stryker-mutator/util';
import type * as jest from '@jest/types';
import type * as jestTestResult from '@jest/test-result';

import { JestOptions } from '../src-generated/jest-runner-options.js';

import { jestTestAdapterFactory } from './jest-test-adapters/index.js';
import {
  JestTestAdapter,
  RunSettings,
} from './jest-test-adapters/jest-test-adapter.js';
import { JestConfigLoader } from './config-loaders/jest-config-loader.js';
import { withCoverageAnalysis, withHitLimit } from './jest-plugins/index.js';
import { pluginTokens } from './plugin-di.js';
import { configLoaderFactory } from './config-loaders/index.js';
import { JestRunnerOptionsWithStrykerOptions } from './jest-runner-options-with-stryker-options.js';
import { JEST_OVERRIDE_OPTIONS } from './jest-override-options.js';
import {
  determineResolveFromDirectory,
  JestConfigWrapper,
  JestWrapper,
  verifyAllTestFilesHaveCoverage,
} from './utils/index.js';
import { state } from './jest-plugins/messaging.cjs';

export function createJestTestRunnerFactory(
  namespace:
    | typeof INSTRUMENTER_CONSTANTS.NAMESPACE
    | '__stryker2__' = INSTRUMENTER_CONSTANTS.NAMESPACE,
): {
  (injector: Injector<PluginContext>): JestTestRunner;
  inject: ['$injector'];
} {
  jestTestRunnerFactory.inject = tokens(commonTokens.injector);
  function jestTestRunnerFactory(injector: Injector<PluginContext>) {
    return injector
      .provideValue(pluginTokens.resolve, createRequire(process.cwd()).resolve)
      .provideFactory(
        pluginTokens.resolveFromDirectory,
        determineResolveFromDirectory,
      )
      .provideValue(pluginTokens.requireFromCwd, requireResolve)
      .provideValue(pluginTokens.processEnv, process.env)
      .provideClass(pluginTokens.jestWrapper, JestWrapper)
      .provideClass(pluginTokens.jestConfigWrapper, JestConfigWrapper)
      .provideFactory(pluginTokens.jestTestAdapter, jestTestAdapterFactory)
      .provideFactory(pluginTokens.configLoader, configLoaderFactory)
      .provideValue(pluginTokens.globalNamespace, namespace)
      .injectClass(JestTestRunner);
  }
  return jestTestRunnerFactory;
}

export const jestTestRunnerFactory = createJestTestRunnerFactory();

export class JestTestRunner implements TestRunner {
  private jestConfig!: jest.Config.InitialOptions;
  private readonly jestOptions: JestOptions;
  private readonly enableFindRelatedTests!: boolean;

  public static inject = tokens(
    commonTokens.logger,
    commonTokens.options,
    pluginTokens.jestTestAdapter,
    pluginTokens.configLoader,
    pluginTokens.jestWrapper,
    pluginTokens.globalNamespace,
  );

  constructor(
    private readonly log: Logger,
    options: StrykerOptions,
    private readonly jestTestAdapter: JestTestAdapter,
    private readonly configLoader: JestConfigLoader,
    private readonly jestWrapper: JestWrapper,
    private readonly globalNamespace:
      | typeof INSTRUMENTER_CONSTANTS.NAMESPACE
      | '__stryker2__',
  ) {
    this.jestOptions = (options as JestRunnerOptionsWithStrykerOptions).jest;
    // Get enableFindRelatedTests from stryker jest options or default to true
    this.enableFindRelatedTests = this.jestOptions.enableFindRelatedTests;
    if (this.enableFindRelatedTests) {
      this.log.debug(
        'Running jest with --findRelatedTests flag. Set jest.enableFindRelatedTests to false to run all tests on every mutant.',
      );
    } else {
      this.log.debug(
        'Running jest without --findRelatedTests flag. Set jest.enableFindRelatedTests to true to run only relevant tests on every mutant.',
      );
    }
  }

  public async init(): Promise<void> {
    const configFromFile = await this.configLoader.loadConfig();
    this.jestConfig = this.mergeConfigSettings(
      configFromFile,
      this.jestOptions || {},
    );
  }

  public capabilities(): TestRunnerCapabilities {
    return { reloadEnvironment: true };
  }

  public async dryRun({
    coverageAnalysis,
    files,
  }: Pick<DryRunOptions, 'coverageAnalysis' | 'files'>): Promise<DryRunResult> {
    state.coverageAnalysis = coverageAnalysis;
    const fileNamesUnderTest = this.enableFindRelatedTests ? files : undefined;
    const { dryRunResult, jestResult } = await this.run({
      fileNamesUnderTest,
      jestConfig: this.configForDryRun(
        fileNamesUnderTest,
        coverageAnalysis,
        this.jestWrapper,
      ),
      testLocationInResults: true,
    });
    if (
      dryRunResult.status === DryRunStatus.Complete &&
      coverageAnalysis !== 'off'
    ) {
      const errorMessage = verifyAllTestFilesHaveCoverage(
        jestResult,
        state.testFilesWithStrykerEnvironment,
      );
      if (errorMessage) {
        return {
          status: DryRunStatus.Error,
          errorMessage,
        };
      } else {
        dryRunResult.mutantCoverage = state.instrumenterContext.mutantCoverage;
      }
    }
    return dryRunResult;
  }

  public async mutantRun({
    activeMutant,
    sandboxFileName,
    testFilter,
    disableBail,
    hitLimit,
  }: MutantRunOptions): Promise<MutantRunResult> {
    const fileNameUnderTest = this.enableFindRelatedTests
      ? sandboxFileName
      : undefined;
    state.coverageAnalysis = 'off';
    let testNamePattern: string | undefined;
    if (testFilter) {
      testNamePattern = testFilter
        .map((testId) => `(${escapeRegExp(testId)})`)
        .join('|');
    }
    state.instrumenterContext.hitLimit = hitLimit;
    state.instrumenterContext.hitCount = hitLimit ? 0 : undefined;

    try {
      // Use process.env to set the active mutant.
      // We could use `state.strykerStatic.activeMutant`, but that only works with the `StrykerEnvironment` mixin, which is optional
      process.env[INSTRUMENTER_CONSTANTS.ACTIVE_MUTANT_ENV_VARIABLE] =
        activeMutant.id.toString();
      const { dryRunResult } = await this.run({
        fileNamesUnderTest: fileNameUnderTest ? [fileNameUnderTest] : undefined,
        jestConfig: this.configForMutantRun(
          fileNameUnderTest,
          hitLimit,
          this.jestWrapper,
        ),
        testNamePattern,
      });
      return toMutantRunResult(dryRunResult, disableBail);
    } finally {
      delete process.env[INSTRUMENTER_CONSTANTS.ACTIVE_MUTANT_ENV_VARIABLE];
      delete state.instrumenterContext.activeMutant;
    }
  }

  private configForDryRun(
    fileNamesUnderTest: string[] | undefined,
    coverageAnalysis: CoverageAnalysis,
    jestWrapper: JestWrapper,
  ): jest.Config.InitialOptions {
    return withCoverageAnalysis(
      this.configWithRoots(fileNamesUnderTest),
      coverageAnalysis,
      jestWrapper,
    );
  }

  private configForMutantRun(
    fileNameUnderTest: string | undefined,
    hitLimit: number | undefined,
    jestWrapper: JestWrapper,
  ): jest.Config.InitialOptions {
    return withHitLimit(
      this.configWithRoots(fileNameUnderTest ? [fileNameUnderTest] : undefined),
      hitLimit,
      jestWrapper,
    );
  }

  private configWithRoots(
    fileNamesUnderTest: string[] | undefined,
  ): jest.Config.InitialOptions {
    let config: jest.Config.InitialOptions;

    if (fileNamesUnderTest && this.jestConfig.roots) {
      // Make sure the file under test lives inside one of the roots
      config = {
        ...this.jestConfig,
        roots: [
          ...this.jestConfig.roots,
          ...new Set(fileNamesUnderTest.map((file) => path.dirname(file))),
        ],
      };
    } else {
      config = this.jestConfig;
    }
    return config;
  }

  private async run(settings: RunSettings): Promise<{
    dryRunResult: DryRunResult;
    jestResult: jestTestResult.AggregatedResult;
  }> {
    this.setEnv();
    if (this.log.isTraceEnabled()) {
      this.log.trace('Invoking Jest with config %s', JSON.stringify(settings));
    }
    const { results } = await this.jestTestAdapter.run(settings);
    return {
      dryRunResult: this.collectRunResult(results),
      jestResult: results,
    };
  }

  private collectRunResult(
    results: jestTestResult.AggregatedResult,
  ): DryRunResult {
    const timeoutResult = determineHitLimitReached(
      state.instrumenterContext.hitCount,
      state.instrumenterContext.hitLimit,
    );
    if (timeoutResult) {
      return timeoutResult;
    }
    if (results.numRuntimeErrorTestSuites) {
      const errorMessage = results.testResults
        .map((testSuite) =>
          this.collectSerializableErrorText(testSuite.testExecError),
        )
        .filter(notEmpty)
        .join(', ');
      return {
        status: DryRunStatus.Error,
        errorMessage,
      };
    } else {
      return {
        status: DryRunStatus.Complete,
        tests: this.processTestResults(results.testResults),
      };
    }
  }

  private collectSerializableErrorText(
    error?: jest.TestResult.SerializableError,
  ): string | undefined {
    return (
      error &&
      `${'code' in error ? `${String(error.code)} ` : ''}${error.message} ${error.stack}`
    );
  }

  private setEnv() {
    // Force colors off: https://github.com/chalk/supports-color#info
    process.env.FORCE_COLOR = '0';
    // Set node environment for issues like these: https://github.com/stryker-mutator/stryker-js/issues/3580
    process.env.NODE_ENV = 'test';
  }

  private processTestResults(
    suiteResults: jestTestResult.TestResult[],
  ): TestResult[] {
    const testResults: TestResult[] = [];

    for (const suiteResult of suiteResults) {
      for (const testResult of suiteResult.testResults) {
        const result: BaseTestResult = {
          id: testResult.fullName,
          name: testResult.fullName,
          timeSpentMs: testResult.duration ?? 0,
          fileName: suiteResult.testFilePath,
          startPosition: testResult.location
            ? {
                // Stryker works 0-based internally, jest works 1-based: https://jestjs.io/docs/cli#--testlocationinresults
                line: testResult.location.line - 1,
                column: testResult.location.column,
              }
            : undefined,
        };

        switch (testResult.status) {
          case 'passed':
            testResults.push({
              status: TestStatus.Success,
              ...result,
            });
            break;
          case 'failed':
            testResults.push({
              status: TestStatus.Failed,
              failureMessage: testResult.failureMessages.join(', '),
              ...result,
            });
            break;
          default:
            testResults.push({
              status: TestStatus.Skipped,
              ...result,
            });
            break;
        }
      }
    }

    return testResults;
  }

  private mergeConfigSettings(
    configFromFile: jest.Config.InitialOptions,
    options: JestOptions,
  ): jest.Config.InitialOptions {
    const config = (options.config ?? {}) as jest.Config.InitialOptions;
    const stringify = (obj: unknown) => JSON.stringify(obj, null, 2);
    this.log.debug(
      `Merging file-based config ${stringify(configFromFile)}
      with custom config ${stringify(config)}
      and default (internal) stryker config ${stringify(JEST_OVERRIDE_OPTIONS)}`,
    );
    const mergedConfig: jest.Config.InitialOptions = {
      ...configFromFile,
      ...config,
      ...JEST_OVERRIDE_OPTIONS,
    };
    mergedConfig.globals = {
      ...mergedConfig.globals,
      __strykerGlobalNamespace__: this.globalNamespace,
    };
    return mergedConfig;
  }
}
