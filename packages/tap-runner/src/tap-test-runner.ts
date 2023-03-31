import { spawn } from 'child_process';

import path from 'path';

import { fileURLToPath } from 'url';

import { readFile, rm } from 'fs/promises';

import os from 'os';

import * as tap from 'tap-parser';

import { Logger } from '@stryker-mutator/api/logging';
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

export class TapTestRunner implements TestRunner {
  public static inject = tokens(commonTokens.logger, commonTokens.options, pluginTokens.globalNamespace);
  private testFiles: string[] = [];
  private static readonly hookFile = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'setup', 'hook.cjs');

  constructor(
    private readonly logger: Logger,
    private readonly options: StrykerOptions,
    private readonly globalNamespace: typeof INSTRUMENTER_CONSTANTS.NAMESPACE | '__stryker2__'
  ) {}

  public capabilities(): Promise<TestRunnerCapabilities> | TestRunnerCapabilities {
    return { reloadEnvironment: false };
  }

  public async init(): Promise<void> {
    this.testFiles = await findTestyLookingFiles();
  }

  public async dryRun(options: DryRunOptions): Promise<DryRunResult> {
    return this.run(options.disableBail, options.files);
  }

  public async mutantRun(options: MutantRunOptions): Promise<MutantRunResult> {
    return toMutantRunResult(await this.run(options.disableBail, options.testFilter, options.activeMutant.id, options.hitLimit));
  }

  private async run(disableBail: boolean, testFilter?: string[], activeMutant?: string, hitLimit?: number): Promise<DryRunResult> {
    try {
      const testFiles = testFilter ?? this.testFiles;

      const runs: TestResult[] = [];
      const totalCoverage: MutantCoverage = {
        static: {},
        perTest: {},
      };

      for (const testFile of testFiles) {
        const { testResult, coverage } = await this.runFile(testFile, disableBail, activeMutant, hitLimit);
        runs.push(testResult);
        totalCoverage.perTest[testFile] = coverage?.static ?? {};

        if (testResult.status !== TestStatus.Success && !disableBail) {
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

  private async runFile(
    testFile: string,
    disableBail: boolean,
    activeMutant?: string,
    hitLimit?: number
  ): Promise<{ testResult: TestResult; coverage: MutantCoverage | undefined }> {
    return new Promise((resolve, reject) => {
      const env: NodeJS.ProcessEnv = {
        ...process.env,
        ['__stryker__hit-limit']: hitLimit?.toString(),
        ['__stryker__namespace']: this.globalNamespace,
        [INSTRUMENTER_CONSTANTS.ACTIVE_MUTANT_ENV_VARIABLE]: activeMutant,
      };
      const tapProcess = spawn('node', ['-r', TapTestRunner.hookFile, testFile], { env });

      const failedTests: tap.TapError[] = [];
      const config = { bail: !disableBail };

      const parser = new tap.Parser(config, async (result) => {
        const fileName = `stryker-output-${tapProcess.pid}.json`;
        const fileContent = await readFile(fileName, 'utf-8');
        await rm(fileName);
        const file = JSON.parse(fileContent) as InstrumenterContext;

        const hitLimitReached = determineHitLimitReached(file.hitCount, hitLimit);
        if (hitLimitReached) {
          reject(new HitLimitError(hitLimitReached.reason));
          return;
        }

        resolve({ testResult: this.tapResultToTestResult(testFile, result, failedTests), coverage: file.mutantCoverage });
      });

      parser.on('bailout', () => {
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
        failureMessage: getFailureMessage(),
      };
    }

    function getFailureMessage(): string {
      if (failedTests.length) {
        return failedTests.map((f) => `${f.fullname}: ${f.name}`).join(', ');
      }
      if (typeof result.bailout == 'string') {
        return result.bailout;
      }
      return 'Unknown reason to failure';
    }
  }
}
