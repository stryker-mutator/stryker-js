import path from 'path';

import { fileURLToPath } from 'url';

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
  SurvivedMutantRunResult,
  MutantRunStatus,
  TestResult,
  TestStatus,
} from '@stryker-mutator/api/test-runner';

import { createVitest } from 'vitest/node';
import { File, Suite, Task, Test } from 'vitest';

import { collectTestName } from './utils/collect-test-name.js';

function resolveSetupFile(fileName: string) {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'setup', fileName);
}

export class VitestTestRunner implements TestRunner {
  public static inject = [commonTokens.logger, commonTokens.options, 'globalNamespace'] as const;

  constructor(private readonly log: Logger, private readonly options: StrykerOptions, private readonly globalNamespace: string) {}

  public capabilities(): TestRunnerCapabilities {
    return { reloadEnvironment: false };
  }

  public async dryRun(options: DryRunOptions): Promise<DryRunResult> {
    const ctx = await createVitest('test', {
      setupFiles: [
        resolveSetupFile('dry-run-true.js'),
        resolveSetupFile(`global-namespace-${this.globalNamespace}.js`),
        resolveSetupFile('vitest-setup.js'),
      ],
      threads: false,
    });
    await ctx.start();
    const tests = ctx.state.getFiles().flatMap((file) => this.getTestsFromSuite(file));
    const testResults: TestResult[] = tests.map((test) => ({
      id: test.id,
      name: test.name,
      timeSpentMs: test.result?.duration ?? 0,
      fileName: collectTestName({ name: test.name, suite: test.suite }),
      status: TestStatus.Success,
    }));
    return {
      status: DryRunStatus.Complete,
      tests: testResults,
      mutantCoverage: JSON.parse(await fs.readFile(resolveSetupFile('__stryker__.json'), 'utf-8')).mutantCoverage,
    };
  }

  public async mutantRun(options: MutantRunOptions): Promise<MutantRunResult> {
    // TODO: Implement
    return { nrOfTests: 1, status: MutantRunStatus.Survived } as SurvivedMutantRunResult;
  }

  private getTestsFromSuite(suite: Suite): Test[] {
    return suite.tasks.flatMap((task) => {
      if (task.type === 'suite') {
        return this.getTestsFromSuite(task);
      } else if (task.type === 'test') {
        return task;
      } else {
        return [];
      }
    });
  }
}

export const vitestTestRunnerFactory = createVitestTestRunnerFactory();

export function createVitestTestRunnerFactory(
  namespace: typeof INSTRUMENTER_CONSTANTS.NAMESPACE | '__stryker2__' = INSTRUMENTER_CONSTANTS.NAMESPACE
): {
  (injector: Injector<PluginContext>): VitestTestRunner;
  inject: ['$injector'];
} {
  createJasmineTestRunner.inject = tokens(commonTokens.injector);
  function createJasmineTestRunner(injector: Injector<PluginContext>) {
    return injector.provideValue('globalNamespace', namespace).injectClass(VitestTestRunner);
  }
  return createJasmineTestRunner;
}
