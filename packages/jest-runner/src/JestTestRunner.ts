import { StrykerOptions, INSTRUMENTER_CONSTANTS, Mutant } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, Injector, PluginContext, tokens } from '@stryker-mutator/api/plugin';
import {
  TestRunner2,
  MutantRunOptions,
  DryRunResult,
  MutantRunResult,
  toMutantRunResult,
  DryRunStatus,
  TestResult,
  TestStatus,
} from '@stryker-mutator/api/test_runner2';
import { notEmpty } from '@stryker-mutator/util';
import type * as jest from '@jest/types';
import type * as jestTestResult from '@jest/test-result';

import { SerializableError } from '@jest/types/build/TestResult';

import { jestTestAdapterFactory } from './jestTestAdapters';
import JestTestAdapter from './jestTestAdapters/JestTestAdapter';
import JestConfigLoader from './configLoaders/JestConfigLoader';
import { configLoaderToken, processEnvToken, jestTestAdapterToken, jestVersionToken } from './pluginTokens';
import { configLoaderFactory } from './configLoaders';
import { JestRunnerOptionsWithStrykerOptions } from './JestRunnerOptionsWithStrykerOptions';
import JEST_OVERRIDE_OPTIONS from './jestOverrideOptions';

export function jestTestRunnerFactory(injector: Injector<PluginContext>) {
  return injector
    .provideValue(processEnvToken, process.env)
    .provideValue(jestVersionToken, require('jest/package.json').version as string)
    .provideFactory(jestTestAdapterToken, jestTestAdapterFactory)
    .provideFactory(configLoaderToken, configLoaderFactory)
    .injectClass(JestTestRunner);
}
jestTestRunnerFactory.inject = tokens(commonTokens.injector);

export default class JestTestRunner implements TestRunner2 {
  private readonly jestConfig: jest.Config.InitialOptions;
  private mutantRunJestConfigCache: jest.Config.InitialOptions | undefined;

  private readonly enableFindRelatedTests: boolean;

  public static inject = tokens(commonTokens.logger, commonTokens.options, processEnvToken, jestTestAdapterToken, configLoaderToken);
  constructor(
    private readonly log: Logger,
    options: StrykerOptions,
    private readonly processEnvRef: NodeJS.ProcessEnv,
    private readonly jestTestAdapter: JestTestAdapter,
    configLoader: JestConfigLoader
  ) {
    const jestOptions = options as JestRunnerOptionsWithStrykerOptions;
    // Get jest configuration from stryker options and assign it to jestConfig
    const configFromFile = configLoader.loadConfig();
    this.jestConfig = this.mergeConfigSettings(configFromFile, (jestOptions.jest.config as any) || {});

    // Get enableFindRelatedTests from stryker jest options or default to true
    this.enableFindRelatedTests = jestOptions.jest.enableFindRelatedTests ?? true;

    if (this.enableFindRelatedTests) {
      this.log.debug('Running jest with --findRelatedTests flag. Set jest.enableFindRelatedTests to false to run all tests on every mutant.');
    } else {
      this.log.debug(
        'Running jest without --findRelatedTests flag. Set jest.enableFindRelatedTests to true to run only relevant tests on every mutant.'
      );
    }

    // basePath will be used in future releases of Stryker as a way to define the project root
    // Default to process.cwd when basePath is not set for now, should be removed when issue is solved
    // https://github.com/stryker-mutator/stryker/issues/650
    this.jestConfig.rootDir = (options.basePath as string) || process.cwd();
    this.log.debug(`Project root is ${this.jestConfig.rootDir}`);
  }

  public dryRun(): Promise<DryRunResult> {
    return this.run(this.jestConfig);
  }
  public async mutantRun({ activeMutant, sandboxFileName }: MutantRunOptions): Promise<MutantRunResult> {
    const fileUnderTest = this.enableFindRelatedTests ? sandboxFileName : undefined;
    const dryRunResult = await this.run(this.getMutantRunOptions(activeMutant), fileUnderTest);
    return toMutantRunResult(dryRunResult);
  }

  private getMutantRunOptions(activeMutant: Mutant): jest.Config.InitialOptions {
    if (!this.mutantRunJestConfigCache) {
      this.mutantRunJestConfigCache = {
        ...this.jestConfig,
        globals: {
          ...this.jestConfig.globals,
        },
      };
    }
    this.mutantRunJestConfigCache.globals![INSTRUMENTER_CONSTANTS.ACTIVE_MUTANT] = activeMutant.id;
    return this.mutantRunJestConfigCache;
  }

  private async run(config: jest.Config.InitialOptions, fileUnderTest: string | undefined = undefined): Promise<DryRunResult> {
    this.setEnv();
    const all = await this.jestTestAdapter.run(config, process.cwd(), fileUnderTest);

    return this.collectRunResult(all.results);
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
        let timeSpentMs = testResult.duration ?? 0;

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

  private mergeConfigSettings(configFromFile: jest.Config.InitialOptions, config: jest.Config.InitialOptions): jest.Config.InitialOptions {
    const stringify = (obj: jest.Config.InitialOptions) => JSON.stringify(obj, null, 2);
    this.log.debug(
      `Merging file-based config ${stringify(configFromFile)} 
      with custom config ${stringify(config)}
      and default (internal) stryker config ${JEST_OVERRIDE_OPTIONS}`
    );
    return {
      ...configFromFile,
      ...config,
      ...JEST_OVERRIDE_OPTIONS,
    };
  }
}
