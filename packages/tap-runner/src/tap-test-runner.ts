import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFile, rm } from 'fs/promises';

import { commonTokens, Injector, PluginContext, tokens } from '@stryker-mutator/api/plugin';
import {
  BaseTestResult,
  determineHitLimitReached,
  DryRunOptions,
  DryRunResult,
  DryRunStatus,
  MutantRunOptions,
  MutantRunResult,
  TestResult,
  TestRunner,
  TestRunnerCapabilities,
  TestStatus,
  TimeoutDryRunResult,
  toMutantRunResult,
} from '@stryker-mutator/api/test-runner';
import { InstrumenterContext, INSTRUMENTER_CONSTANTS, MutantCoverage, StrykerOptions } from '@stryker-mutator/api/core';

import * as pluginTokens from './plugin-tokens.js';
import { findTestyLookingFiles, parseTap, TapResult } from './tap-helper.js';
import { TapRunnerOptionsWithStrykerOptions } from './tap-runner-options-with-stryker-options.js';
import { strykerHitLimit, strykerNamespace, strykerDryRun, tempTapOutputFileName } from './setup/env.cjs';

export function createTapTestRunnerFactory(namespace: typeof INSTRUMENTER_CONSTANTS.NAMESPACE | '__stryker2__' = INSTRUMENTER_CONSTANTS.NAMESPACE): {
  (injector: Injector<PluginContext>): TapTestRunner;
  inject: ['$injector'];
} {
  createTapTestRunner.inject = tokens(commonTokens.injector);
  function createTapTestRunner(injector: Injector<PluginContext>) {
    return injector.provideValue(pluginTokens.globalNamespace, namespace).injectClass(TapTestRunner);
  }
  return createTapTestRunner;
}

export const createTapTestRunner = createTapTestRunnerFactory();

class HitLimitError extends Error {
  constructor(public readonly result: TimeoutDryRunResult) {
    super(result.reason);
  }
}

interface TapRunOptions {
  disableBail: boolean;
  activeMutant?: string;
  hitLimit?: number;
  dryRun?: boolean;
}

export class TapTestRunner implements TestRunner {
  public static inject = tokens(commonTokens.options, pluginTokens.globalNamespace);
  private testFiles: string[] = [];
  private static readonly hookFile = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'setup', 'hook.cjs');
  private readonly options: TapRunnerOptionsWithStrykerOptions;

  constructor(options: StrykerOptions, private readonly globalNamespace: typeof INSTRUMENTER_CONSTANTS.NAMESPACE | '__stryker2__') {
    this.options = options as TapRunnerOptionsWithStrykerOptions;
  }

  public capabilities(): Promise<TestRunnerCapabilities> | TestRunnerCapabilities {
    return { reloadEnvironment: true };
  }

  public async init(): Promise<void> {
    this.testFiles = await findTestyLookingFiles(this.options.tap.testFiles);
  }

  public async dryRun(options: DryRunOptions): Promise<DryRunResult> {
    return this.run({ disableBail: options.disableBail, dryRun: true });
  }

  public async mutantRun(options: MutantRunOptions): Promise<MutantRunResult> {
    return toMutantRunResult(
      await this.run({ disableBail: options.disableBail, activeMutant: options.activeMutant.id, hitLimit: options.hitLimit }, options.testFilter)
    );
  }

  private async run(testOptions: TapRunOptions, testFilter?: string[]): Promise<DryRunResult> {
    try {
      const testFiles = testFilter ?? this.testFiles;

      const runs: TestResult[] = [];
      const totalCoverage: MutantCoverage = {
        static: {},
        perTest: {},
      };

      for (const testFile of testFiles) {
        const { testResult, coverage } = await this.runFile(testFile, testOptions);
        runs.push(testResult);
        totalCoverage.perTest[testFile] = coverage?.static ?? {};

        if (testResult.status !== TestStatus.Success && !testOptions.disableBail) {
          break;
        }
      }

      return {
        status: DryRunStatus.Complete,
        tests: runs,
        mutantCoverage: totalCoverage,
      };
    } catch (err) {
      if (err instanceof HitLimitError) {
        return err.result;
      }
      throw err;
    }
  }

  private async runFile(testFile: string, testOptions: TapRunOptions): Promise<{ testResult: TestResult; coverage: MutantCoverage | undefined }> {
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      [strykerHitLimit]: testOptions.hitLimit?.toString(),
      [strykerNamespace]: this.globalNamespace,
      [INSTRUMENTER_CONSTANTS.ACTIVE_MUTANT_ENV_VARIABLE]: testOptions.activeMutant,
      [strykerDryRun]: testOptions.dryRun?.toString(),
    };
    const tapProcess = spawn('node', ['-r', TapTestRunner.hookFile, testFile], { env });
    const exitAsPromised = new Promise((resolve) => tapProcess.on('exit', resolve));
    const result = await parseTap(tapProcess, testOptions.disableBail);
    // wait for the process to end before continuing, because the tapParser sometimes results before the process ends which causes a start of a new process while to current one is still running.
    await exitAsPromised;
    const fileName = tempTapOutputFileName(tapProcess.pid);
    const fileContent = await readFile(fileName, 'utf-8');
    await rm(fileName);
    const file = JSON.parse(fileContent) as InstrumenterContext;
    const hitLimitReached = determineHitLimitReached(file.hitCount, testOptions.hitLimit);
    if (hitLimitReached) {
      throw new HitLimitError(hitLimitReached);
    }
    return { testResult: this.tapResultToTestResult(testFile, result), coverage: file.mutantCoverage };
  }

  private tapResultToTestResult(fileName: string, { result, failedTests }: TapResult): TestResult {
    const generic: BaseTestResult = {
      id: fileName,
      name: fileName,
      timeSpentMs: result.time ?? 0,
      fileName: fileName,
      startPosition: undefined,
    };

    if (result.ok) {
      return {
        ...generic,
        status: TestStatus.Success,
      };
    } else {
      return {
        ...generic,
        status: TestStatus.Failed,
        failureMessage: failedTests.map((f) => `${f.fullname}: ${f.name}`).join(', ') ?? 'Unknown issue',
      };
    }
  }
}
