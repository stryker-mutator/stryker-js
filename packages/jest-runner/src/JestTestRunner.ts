import { StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, Injector, OptionsContext, tokens } from '@stryker-mutator/api/plugin';
import { RunOptions, RunResult, RunStatus, TestResult, TestRunner, TestStatus } from '@stryker-mutator/api/test_runner';

import { jestTestAdapterFactory } from './jestTestAdapters';
import JestTestAdapter from './jestTestAdapters/JestTestAdapter';
import { JestRunnerOptionsWithStrykerOptions } from './JestRunnerOptionsWithStrykerOptions';
import JestConfigLoader from './configLoaders/JestConfigLoader';
import { configLoaderToken, processEnvToken, jestTestAdapterToken, jestVersionToken } from './pluginTokens';
import { configLoaderFactory } from './configLoaders';
import JEST_OVERRIDE_OPTIONS from './jestOverrideOptions';

export function jestTestRunnerFactory(injector: Injector<OptionsContext>) {
  return injector
    .provideValue(processEnvToken, process.env)
    .provideValue(jestVersionToken, require('jest/package.json').version as string)
    .provideFactory(jestTestAdapterToken, jestTestAdapterFactory)
    .provideFactory(configLoaderToken, configLoaderFactory)
    .injectClass(JestTestRunner);
}
jestTestRunnerFactory.inject = tokens(commonTokens.injector);

export default class JestTestRunner implements TestRunner {
  private readonly jestConfig: Jest.Configuration;

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
    this.enableFindRelatedTests = jestOptions.jest.enableFindRelatedTests;
    if (this.enableFindRelatedTests === undefined) {
      this.enableFindRelatedTests = true;
    }

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

  public async run(options: RunOptions): Promise<RunResult> {
    this.setNodeEnv();
    const { results } = await this.jestTestAdapter.run(
      this.jestConfig,
      process.cwd(),
      this.enableFindRelatedTests ? options.mutatedFileName : undefined
    );

    // Get the non-empty errorMessages from the jest RunResult, it's safe to cast to Array<string> here because we filter the empty error messages
    const errorMessages = results.testResults
      .map((testSuite: Jest.TestResult) => testSuite.failureMessage)
      .filter((errorMessage) => errorMessage) as string[];

    return {
      errorMessages,
      status: results.numRuntimeErrorTestSuites > 0 ? RunStatus.Error : RunStatus.Complete,
      tests: this.processTestResults(results.testResults),
    };
  }

  private setNodeEnv() {
    // Jest CLI will set process.env.NODE_ENV to 'test' when it's null, do the same here
    // https://github.com/facebook/jest/blob/master/packages/jest-cli/bin/jest.js#L12-L14
    if (!this.processEnvRef.NODE_ENV) {
      this.processEnvRef.NODE_ENV = 'test';
    }
  }

  private processTestResults(suiteResults: Jest.TestResult[]): TestResult[] {
    const testResults: TestResult[] = [];

    for (const suiteResult of suiteResults) {
      for (const testResult of suiteResult.testResults) {
        testResults.push({
          failureMessages: testResult.failureMessages,
          name: testResult.fullName,
          status: this.determineTestResultStatus(testResult.status),
          timeSpentMs: testResult.duration ? testResult.duration : 0,
        });
      }
    }

    return testResults;
  }

  private determineTestResultStatus(status: Jest.Status) {
    switch (status) {
      case 'passed':
        return TestStatus.Success;
      case 'failed':
        return TestStatus.Failed;
      default:
        return TestStatus.Skipped;
    }
  }

  private mergeConfigSettings(configFromFile: Jest.Configuration, config: Jest.Configuration) {
    const stringify = (obj: Record<string, any>) => JSON.stringify(obj, null, 2);
    this.log.trace(
      `Merging file-based config ${stringify(configFromFile)} 
      with custom config ${stringify(config)}
      and default (internal) stryker config ${JEST_OVERRIDE_OPTIONS}`
    );
    return Object.assign(configFromFile, config, JEST_OVERRIDE_OPTIONS);
  }
}
