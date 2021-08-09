// monkey patch exit first!!
import './utils/monkey-patch-exit';

import path from 'path';

import { StrykerOptions, INSTRUMENTER_CONSTANTS, MutantCoverage } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, Injector, PluginContext, tokens } from '@stryker-mutator/api/plugin';
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
} from '@stryker-mutator/api/test-runner';
import { escapeRegExp, notEmpty, requireResolve } from '@stryker-mutator/util';
import type * as jest from '@jest/types';
import type * as jestTestResult from '@jest/test-result';
import { SerializableError } from '@jest/types/build/TestResult';

import { JestOptions } from '../src-generated/jest-runner-options';

import { jestTestAdapterFactory } from './jest-test-adapters';
import { JestTestAdapter, RunSettings } from './jest-test-adapters/jest-test-adapter';
import { JestConfigLoader } from './config-loaders/jest-config-loader';
import { withCoverageAnalysis } from './jest-plugins';
import * as pluginTokens from './plugin-tokens';
import { configLoaderFactory } from './config-loaders';
import { JestRunnerOptionsWithStrykerOptions } from './jest-runner-options-with-stryker-options';
import { JEST_OVERRIDE_OPTIONS } from './jest-override-options';
import { jestWrapper, mergeMutantCoverage, verifyAllTestFilesHaveCoverage } from './utils';
import { state } from './messaging';

export function createJestTestRunnerFactory(namespace: typeof INSTRUMENTER_CONSTANTS.NAMESPACE | '__stryker2__' = INSTRUMENTER_CONSTANTS.NAMESPACE): {
  (injector: Injector<PluginContext>): JestTestRunner;
  inject: ['$injector'];
} {
  jestTestRunnerFactory.inject = tokens(commonTokens.injector);
  function jestTestRunnerFactory(injector: Injector<PluginContext>) {
    return injector
      .provideValue(pluginTokens.processEnv, process.env)
      .provideValue(pluginTokens.jestVersion, jestWrapper.getVersion())
      .provideFactory(pluginTokens.jestTestAdapter, jestTestAdapterFactory)
      .provideFactory(pluginTokens.configLoader, configLoaderFactory)
      .provideValue(pluginTokens.globalNamespace, namespace)
      .injectClass(JestTestRunner);
  }
  return jestTestRunnerFactory;
}

export const jestTestRunnerFactory = createJestTestRunnerFactory();

export class JestTestRunner implements TestRunner {
  private readonly jestConfig: jest.Config.InitialOptions;
  private readonly jestOptions: JestOptions;
  private readonly enableFindRelatedTests: boolean;

  public static inject = tokens(
    commonTokens.logger,
    commonTokens.options,
    pluginTokens.processEnv,
    pluginTokens.jestTestAdapter,
    pluginTokens.configLoader,
    pluginTokens.globalNamespace
  );

  constructor(
    private readonly log: Logger,
    options: StrykerOptions,
    private readonly processEnvRef: NodeJS.ProcessEnv,
    private readonly jestTestAdapter: JestTestAdapter,
    configLoader: JestConfigLoader,
    private readonly globalNamespace: typeof INSTRUMENTER_CONSTANTS.NAMESPACE | '__stryker2__'
  ) {
    this.jestOptions = (options as JestRunnerOptionsWithStrykerOptions).jest;
    // Get jest configuration from stryker options and assign it to jestConfig
    const configFromFile = configLoader.loadConfig();
    this.jestConfig = this.mergeConfigSettings(configFromFile, (options as JestRunnerOptionsWithStrykerOptions) || {});

    // Get enableFindRelatedTests from stryker jest options or default to true
    this.enableFindRelatedTests = this.jestOptions.enableFindRelatedTests;

    if (this.enableFindRelatedTests) {
      this.log.debug('Running jest with --findRelatedTests flag. Set jest.enableFindRelatedTests to false to run all tests on every mutant.');
    } else {
      this.log.debug(
        'Running jest without --findRelatedTests flag. Set jest.enableFindRelatedTests to true to run only relevant tests on every mutant.'
      );
    }
  }

  public async dryRun({ coverageAnalysis }: Pick<DryRunOptions, 'coverageAnalysis'>): Promise<DryRunResult> {
    state.coverageAnalysis = coverageAnalysis;
    const mutantCoverage: MutantCoverage = { perTest: {}, static: {} };
    const fileNamesWithMutantCoverage: string[] = [];
    if (coverageAnalysis !== 'off') {
      state.setMutantCoverageHandler((fileName, report) => {
        mergeMutantCoverage(mutantCoverage, report);
        fileNamesWithMutantCoverage.push(fileName);
      });
    }
    try {
      const { dryRunResult, jestResult } = await this.run({
        jestConfig: withCoverageAnalysis(this.jestConfig, coverageAnalysis),
        testLocationInResults: true,
      });
      if (dryRunResult.status === DryRunStatus.Complete && coverageAnalysis !== 'off') {
        const errorMessage = verifyAllTestFilesHaveCoverage(jestResult, fileNamesWithMutantCoverage);
        if (errorMessage) {
          return {
            status: DryRunStatus.Error,
            errorMessage,
          };
        } else {
          dryRunResult.mutantCoverage = mutantCoverage;
        }
      }
      return dryRunResult;
    } finally {
      state.resetMutantCoverageHandler();
    }
  }

  public async mutantRun({ activeMutant, sandboxFileName, testFilter }: MutantRunOptions): Promise<MutantRunResult> {
    const fileNameUnderTest = this.enableFindRelatedTests ? sandboxFileName : undefined;
    state.coverageAnalysis = 'off';
    let testNamePattern: string | undefined;
    if (testFilter) {
      testNamePattern = testFilter.map((testId) => `(${escapeRegExp(testId)})`).join('|');
    }
    process.env[INSTRUMENTER_CONSTANTS.ACTIVE_MUTANT_ENV_VARIABLE] = activeMutant.id.toString();
    try {
      const { dryRunResult } = await this.run({
        fileNameUnderTest,
        jestConfig: this.configForMutantRun(fileNameUnderTest),
        testNamePattern,
      });
      return toMutantRunResult(dryRunResult, true);
    } finally {
      delete process.env[INSTRUMENTER_CONSTANTS.ACTIVE_MUTANT_ENV_VARIABLE];
    }
  }

  private configForMutantRun(fileNameUnderTest: string | undefined): jest.Config.InitialOptions {
    if (fileNameUnderTest && this.jestConfig.roots) {
      // Make sure the file under test lives inside one of the roots
      return {
        ...this.jestConfig,
        roots: [...this.jestConfig.roots, path.dirname(fileNameUnderTest)],
      };
    }
    return this.jestConfig;
  }

  private async run(settings: RunSettings): Promise<{ dryRunResult: DryRunResult; jestResult: jestTestResult.AggregatedResult }> {
    this.setEnv();
    if (this.log.isTraceEnabled()) {
      this.log.trace('Invoking Jest with config %s', JSON.stringify(settings));
    }
    const { results } = await this.jestTestAdapter.run(settings);
    return { dryRunResult: this.collectRunResult(results), jestResult: results };
  }

  private collectRunResult(results: jestTestResult.AggregatedResult): DryRunResult {
    if (results.numRuntimeErrorTestSuites) {
      const errorMessage = results.testResults
        .map((testSuite) => this.collectSerializableErrorText(testSuite.testExecError))
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

  private collectSerializableErrorText(error: SerializableError | undefined): string | undefined {
    return error && `${error.code && `${error.code} `}${error.message} ${error.stack}`;
  }

  private setEnv() {
    // Jest CLI will set process.env.NODE_ENV to 'test' when it's null, do the same here
    // https://github.com/facebook/jest/blob/master/packages/jest-cli/bin/jest.js#L12-L14
    if (!this.processEnvRef.NODE_ENV) {
      this.processEnvRef.NODE_ENV = 'test';
    }

    // Force colors off: https://github.com/chalk/supports-color#info
    process.env.FORCE_COLOR = '0';

    if (this.jestOptions.projectType === 'create-react-app') {
      try {
        requireResolve('react-scripts/config/env.js');
      } catch (err) {
        this.log.warn(
          'Unable to load environment variables using "react-scripts/config/env.js". The environment variables might differ from expected. Please open an issue if you think this is a bug: https://github.com/stryker-mutator/stryker-js/issues/new/choose.'
        );
        this.log.debug('Inner error', err);
      }
    }
  }

  private processTestResults(suiteResults: jestTestResult.TestResult[]): TestResult[] {
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

  private mergeConfigSettings(configFromFile: jest.Config.InitialOptions, options: JestRunnerOptionsWithStrykerOptions): jest.Config.InitialOptions {
    const config = (options.jest.config ?? {}) as jest.Config.InitialOptions;
    // when disableBail is false (by default) we tell jest to bail
    config.bail = !options.disableBail;
    const stringify = (obj: unknown) => JSON.stringify(obj, null, 2);
    this.log.debug(
      `Merging file-based config ${stringify(configFromFile)}
      with custom config ${stringify(config)}
      and default (internal) stryker config ${stringify(JEST_OVERRIDE_OPTIONS)}`
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
