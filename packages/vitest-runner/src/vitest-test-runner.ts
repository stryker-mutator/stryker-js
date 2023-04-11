import fs from 'fs/promises';

import { INSTRUMENTER_CONSTANTS, MutantCoverage, StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, Injector, PluginContext, tokens } from '@stryker-mutator/api/plugin';
import {
  TestRunner,
  DryRunResult,
  MutantRunOptions,
  MutantRunResult,
  TestRunnerCapabilities,
  DryRunStatus,
  TestResult,
  toMutantRunResult,
  determineHitLimitReached,
  DryRunOptions,
} from '@stryker-mutator/api/test-runner';

import { createVitest, Vitest } from 'vitest/node';
import { escapeRegExp } from '@stryker-mutator/util';

import { collectTestsFromSuite } from './utils/collect-tests-from-suite.js';
import { convertTestToTestResult, fromTestId } from './utils/convert-test-to-test-result.js';
import { FileCommunicator } from './file-communicator.js';

type StrykerNamespace = '__stryker__' | '__stryker2__';

export class VitestTestRunner implements TestRunner {
  public static inject = [commonTokens.logger, commonTokens.options, 'globalNamespace'] as const;
  private ctx!: Vitest;
  private readonly fileCommunicator: FileCommunicator;

  constructor(private readonly log: Logger, private readonly options: StrykerOptions, private readonly globalNamespace: StrykerNamespace) {
    this.fileCommunicator = new FileCommunicator(globalNamespace);
  }

  public capabilities(): TestRunnerCapabilities {
    return { reloadEnvironment: false };
  }

  public async init(): Promise<void> {
    this.ctx = await createVitest('test', {
      threads: false,
      watch: false,
      onConsoleLog: () => false,
    });
    this.ctx.config.setupFiles = [this.fileCommunicator.setupFile, ...this.ctx.config.setupFiles];
    if (this.log.isDebugEnabled()) {
      this.log.debug(`vitest final config: ${JSON.stringify(this.ctx.config, null, 2)}`);
    }
  }

  public async dryRun(options: DryRunOptions): Promise<DryRunResult> {
    await this.fileCommunicator.setDryRun(options);
    const testResult = await this.run();
    const mutantCoverage: MutantCoverage = JSON.parse(await fs.readFile(this.fileCommunicator.coverageFile, 'utf-8'));
    await fs.rm(this.fileCommunicator.coverageFile);
    if (testResult.status === DryRunStatus.Complete) {
      return {
        status: testResult.status,
        tests: testResult.tests,
        mutantCoverage,
      };
    }
    return testResult;
  }

  public async mutantRun(options: MutantRunOptions): Promise<MutantRunResult> {
    await this.fileCommunicator.setMutantRun(options);
    const dryRunResult = await this.run(options.testFilter);
    const hitCount = parseInt(await fs.readFile(this.fileCommunicator.hitCountFile, 'utf-8'));
    await fs.rm(this.fileCommunicator.hitCountFile);
    const timeOut = determineHitLimitReached(hitCount, options.hitLimit);
    return toMutantRunResult(timeOut ?? dryRunResult);
  }

  private async run(testIds: string[] = []): Promise<DryRunResult> {
    if (testIds.length > 0) {
      const regexTestNameFilter = testIds
        .map(fromTestId)
        .map(({ name }) => escapeRegExp(name))
        .join('|');
      const regex = new RegExp(regexTestNameFilter);
      const testFiles = testIds.map(fromTestId).map(({ file }) => file);
      this.ctx.config.testNamePattern = regex;
      await this.ctx.start(testFiles);
    } else {
      await this.ctx.start();
    }
    const tests = this.ctx.state.getFiles().flatMap((file) => collectTestsFromSuite(file));
    const testResults: TestResult[] = tests.map((test) => convertTestToTestResult(test));
    return { tests: testResults, status: DryRunStatus.Complete };
  }
}

export const vitestTestRunnerFactory = createVitestTestRunnerFactory();

export function createVitestTestRunnerFactory(
  namespace: typeof INSTRUMENTER_CONSTANTS.NAMESPACE | '__stryker2__' = INSTRUMENTER_CONSTANTS.NAMESPACE
): {
  (injector: Injector<PluginContext>): VitestTestRunner;
  inject: ['$injector'];
} {
  createVitestTestRunner.inject = tokens(commonTokens.injector);
  function createVitestTestRunner(injector: Injector<PluginContext>) {
    return injector.provideValue('globalNamespace', namespace).injectClass(VitestTestRunner);
  }
  return createVitestTestRunner;
}
