// monkey patch exit first!!
import './utils/monkey-patch-exit';

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
} from '@stryker-mutator/api/test-runner';
import { escapeRegExp, notEmpty } from '@stryker-mutator/util';
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
import { mergeMutantCoverage, verifyAllTestFilesHaveCoverage } from './utils';
import { state } from './messaging';

export function createJestTestRunnerFactory(
  namespace: typeof INSTRUMENTER_CONSTANTS.NAMESPACE | '__stryker2__' = INSTRUMENTER_CONSTANTS.NAMESPACE
): {
  (injector: Injector<PluginContext>): JestTestRunner;
  inject: ['$injector'];
} {
  jestTestRunnerFactory.inject = tokens(commonTokens.injector);
  function jestTestRunnerFactory(injector: Injector<PluginContext>) {
    return (
      injector
        .provideValue(pluginTokens.processEnv, process.env)
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        .provideValue(pluginTokens.jestVersion, require('jest/package.json').version as string)
        .provideFactory(pluginTokens.jestTestAdapter, jestTestAdapterFactory)
        .provideFactory(pluginTokens.configLoader, configLoaderFactory)
        .provideValue(pluginTokens.globalNamespace, namespace)
        .injectClass(JestTestRunner)
    );
  }
  return jestTestRunnerFactory;
}

export const jestTestRunnerFactory = createJestTestRunnerFactory();

export class JestTestRunner implements TestRunner {
  private readonly jestConfig: jest.Config.InitialOptions;
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
    const jestOptions = options as JestRunnerOptionsWithStrykerOptions;
    // Get jest configuration from stryker options and assign it to jestConfig
    const configFromFile = configLoader.loadConfig();
    this.jestConfig = this.mergeConfigSettings(configFromFile, jestOptions.jest || {});

    // Get enableFindRelatedTests from stryker jest options or default to true
    this.enableFindRelatedTests = jestOptions.jest.enableFindRelatedTests;

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
        projectRoot: process.cwd(),
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
      const { dryRunResult } = await this.run({ fileNameUnderTest, jestConfig: this.jestConfig, projectRoot: process.cwd(), testNamePattern });
      return toMutantRunResult(dryRunResult);
    } finally {
      delete process.env[INSTRUMENTER_CONSTANTS.ACTIVE_MUTANT_ENV_VARIABLE];
    }
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
  }

  private processTestResults(suiteResults: jestTestResult.TestResult[]): TestResult[] {
    const testResults: TestResult[] = [];

    for (const suiteResult of suiteResults) {
      for (const testResult of suiteResult.testResults) {
        let result: TestResult;
        const timeSpentMs = testResult.duration ?? 0;

        switch (testResult.status) {
          case 'passed':
            result = {
              id: testResult.fullName,
              name: testResult.fullName,
              status: TestStatus.Success,
              timeSpentMs,
            };
            break;
          case 'failed':
            result = {
              id: testResult.fullName,
              name: testResult.fullName,
              failureMessage: testResult.failureMessages.join(', '),
              status: TestStatus.Failed,
              timeSpentMs,
            };
            break;
          default:
            result = {
              id: testResult.fullName,
              name: testResult.fullName,
              status: TestStatus.Skipped,
              timeSpentMs,
            };
            break;
        }
        testResults.push(result);
      }
    }

    return testResults;
  }

  private mergeConfigSettings(configFromFile: jest.Config.InitialOptions, options: JestOptions): jest.Config.InitialOptions {
    const config = (options.config ?? {}) as jest.Config.InitialOptions;
    config.bail = options.enableBail;
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
