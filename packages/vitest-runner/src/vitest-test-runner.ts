import fs from 'fs/promises';

import { INSTRUMENTER_CONSTANTS, StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, Injector, PluginContext, tokens } from '@stryker-mutator/api/plugin';
import {
  TestRunner,
  DryRunResult,
  DryRunOptions,
  MutantRunOptions,
  MutantRunResult,
  TestRunnerCapabilities,
  DryRunStatus,
  TestResult,
  toMutantRunResult,
  determineHitLimitReached,
} from '@stryker-mutator/api/test-runner';

import { createVitest, Vitest } from 'vitest/node';

import { escapeRegExp } from '@stryker-mutator/util';

import { collectTestsFromSuite } from './utils/collect-tests-from-suite.js';
import { convertTestToTestResult, fromTestId } from './utils/convert-test-to-test-result.js';
import { resolveSetupFile } from './utils/resolve-setup-file.js';
import { setDryRunValue, setHitLimit, setActiveMutant } from './vitest-file-communication.js';

export class VitestTestRunner implements TestRunner {
  public static inject = [commonTokens.logger, commonTokens.options, 'globalNamespace'] as const;
  private ctx!: Vitest;

  constructor(private readonly log: Logger, private readonly options: StrykerOptions, private readonly globalNamespace: string) {}

  public capabilities(): TestRunnerCapabilities {
    return { reloadEnvironment: false };
  }

  public async init(): Promise<void> {
    this.ctx = await createVitest('test', {
      threads: false,
      watch: false,
      onConsoleLog: () => false,
    });
    this.ctx.config.setupFiles = [
      resolveSetupFile('active-mutant.js'),
      resolveSetupFile('dry-run.js'),
      resolveSetupFile(`global-namespace-${this.globalNamespace}.js`),
      resolveSetupFile('vitest-setup.js'),
      resolveSetupFile('hit-limit.js'),
      ...this.ctx.config.setupFiles,
    ];
  }

  public async dryRun(options: DryRunOptions): Promise<DryRunResult> {
    await setDryRunValue(true);
    const testResult = await this.run(options.files);
    const mutantCoverage = JSON.parse(await fs.readFile(resolveSetupFile('__stryker__.json'), 'utf-8')).mutantCoverage;
    await fs.writeFile(resolveSetupFile('__stryker__.json'), '');
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
    await setDryRunValue(false);
    await setActiveMutant(options.activeMutant, options.mutantActivation !== 'static', this.globalNamespace);
    const dryRunResult = await this.run(options.testFilter, options.hitLimit);
    return toMutantRunResult(dryRunResult);
  }

  private async run(testIds: string[] = [], hitLimit?: number): Promise<DryRunResult> {
    await setHitLimit(this.globalNamespace, hitLimit);
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
    const hitCount = JSON.parse(await fs.readFile(resolveSetupFile('__stryker__.json'), 'utf-8')) as number;
    const timeOut = determineHitLimitReached(hitCount, hitLimit);
    const tests = this.ctx.state.getFiles().flatMap((file) => collectTestsFromSuite(file));
    const testResults: TestResult[] = tests.map((test) => convertTestToTestResult(test));
    return timeOut ? timeOut : { tests: testResults, status: DryRunStatus.Complete };
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
