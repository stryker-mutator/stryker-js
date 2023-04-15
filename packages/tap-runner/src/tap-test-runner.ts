import { spawn } from 'child_process';

import path from 'path';

import { fileURLToPath } from 'url';

import { readFile, rm } from 'fs/promises';

import os from 'os';

import * as tap from 'tap-parser';

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
  toMutantRunResult,
} from '@stryker-mutator/api/test-runner';
import { InstrumenterContext, INSTRUMENTER_CONSTANTS, MutantCoverage, StrykerOptions } from '@stryker-mutator/api/core';

import * as pluginTokens from './plugin-tokens.js';
import { findTestyLookingFiles } from './tap-helper.js';
import { TapRunnerOptionsWithStrykerOptions } from './tap-runner-options-with-stryker-options.js';
import { strykerHitLimit, strykerNamespace, strykerDryRun } from './setup/env.cjs';

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

class HitLimitError extends Error {}

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
    } catch (e) {
      if (e instanceof HitLimitError) {
        return {
          status: DryRunStatus.Timeout,
          reason: e.message,
        };
      }

      throw e;
    }
  }

  private async runFile(testFile: string, testOptions: TapRunOptions): Promise<{ testResult: TestResult; coverage: MutantCoverage | undefined }> {
    return new Promise((resolve, reject) => {
      const env: NodeJS.ProcessEnv = {
        ...process.env,
        [strykerHitLimit]: testOptions.hitLimit?.toString(),
        [strykerNamespace]: this.globalNamespace,
        [INSTRUMENTER_CONSTANTS.ACTIVE_MUTANT_ENV_VARIABLE]: testOptions.activeMutant,
        [strykerDryRun]: testOptions.dryRun?.toString(),
      };
      const tapProcess = spawn('node', ['-r', TapTestRunner.hookFile, testFile], { env });

      const failedTests: tap.TapError[] = [];
      const config = { bail: !testOptions.disableBail };

      const parser = new tap.Parser(config, async (result) => {
        const fileName = `stryker-output-${tapProcess.pid}.json`;
        const fileContent = await readFile(fileName, 'utf-8');
        await rm(fileName);
        const file = JSON.parse(fileContent) as InstrumenterContext;

        const hitLimitReached = determineHitLimitReached(file.hitCount, testOptions.hitLimit);
        if (hitLimitReached) {
          reject(new HitLimitError(hitLimitReached.reason));
          return;
        }

        resolve({ testResult: this.tapResultToTestResult(testFile, result, failedTests), coverage: file.mutantCoverage });
      });

      parser.on('bailout', () => {
        // Bailout within a test file is not supported on windows, because when the process is killed the exit handler which saves the file with the result does not run.
        if (os.platform() !== 'win32') {
          tapProcess.kill();
        }
      });

      parser.on('fail', (reason: tap.TapError) => {
        failedTests.push(reason);
      });

      tapProcess.stdout.pipe(parser);
    });
  }

  private tapResultToTestResult(fileName: string, result: tap.FinalResults, failedTests: tap.TapError[]): TestResult {
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
        failureMessage: failedTests.map((f) => `${f.fullname}: ${f.name}`).join(', ') ?? 'Unkown issue',
      };
    }
  }
}
