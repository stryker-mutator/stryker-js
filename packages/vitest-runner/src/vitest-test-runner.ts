import path from 'path';

import { fileURLToPath } from 'url';

import fs from 'fs/promises';

import { INSTRUMENTER_CONSTANTS, Mutant, StrykerOptions } from '@stryker-mutator/api/core';
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
} from '@stryker-mutator/api/test-runner';

import { createVitest, Vitest } from 'vitest/node';

import { collectTestsFromSuite } from './utils/collect-tests-from-suite.js';
import { convertTestToTestResult } from './utils/convert-test-to-test-result.js';

function resolveSetupFile(fileName: string) {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'setup', fileName);
}

export class VitestTestRunner implements TestRunner {
  public static inject = [commonTokens.logger, commonTokens.options, 'globalNamespace'] as const;
  private ctx!: Vitest;

  constructor(private readonly log: Logger, private readonly options: StrykerOptions, private readonly globalNamespace: string) {}

  public capabilities(): TestRunnerCapabilities {
    return { reloadEnvironment: false };
  }

  public async init(): Promise<void> {
    this.ctx = await createVitest('test', {
      setupFiles: [
        resolveSetupFile('active-mutant.js'),
        resolveSetupFile('dry-run.js'),
        resolveSetupFile(`global-namespace-${this.globalNamespace}.js`),
        resolveSetupFile('vitest-setup.js'),
      ],
      threads: false,
      watch: false,
    });
  }

  public async dryRun(options: DryRunOptions): Promise<DryRunResult> {
    await this.setDryRunValue(true);
    const testResult = await this.run();
    if (testResult.status === DryRunStatus.Complete) {
      return {
        status: testResult.status,
        tests: testResult.tests,
        mutantCoverage: JSON.parse(await fs.readFile(resolveSetupFile('__stryker__.json'), 'utf-8')).mutantCoverage,
      };
    }
    return testResult;
  }

  public async mutantRun(options: MutantRunOptions): Promise<MutantRunResult> {
    await this.setDryRunValue(false);
    await this.setActiveMutant(options.activeMutant);
    this.ctx.config.filters = options.testFilter;
    const dryRunResult = await this.run();
    return toMutantRunResult(dryRunResult);
  }

  private async setDryRunValue(dryRun: boolean) {
    try {
      const content = `globalThis.${this.globalNamespace}.strykerDryRun = ${dryRun}`;
      const fileName = resolveSetupFile('dry-run.js');
      await fs.writeFile(fileName, content);
    } catch (err) {
      console.error(err);
    }
  }

  private async run(): Promise<DryRunResult> {
    await this.ctx.start();
    const tests = this.ctx.state.getFiles().flatMap((file) => collectTestsFromSuite(file));
    const testResults: TestResult[] = tests.map((test) => convertTestToTestResult(test));
    return { tests: testResults, status: DryRunStatus.Complete };
  }

  private async setActiveMutant(mutant: Mutant) {
    try {
      const content = `(function (ns) {
          ns.activeMutant = '${mutant.id}'
          })(globalThis.${this.globalNamespace} || (globalThis.${this.globalNamespace} = {}))`;
      await fs.writeFile(resolveSetupFile('active-mutant.js'), content);
    } catch (err) {
      console.error(err);
    }
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
