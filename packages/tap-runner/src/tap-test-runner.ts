import { spawn } from 'child_process';

import path from 'path';

import { fileURLToPath } from 'url';

import { readFile, rm } from 'fs/promises';

import glob from 'glob';

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
import { INSTRUMENTER_CONSTANTS, StrykerOptions } from '@stryker-mutator/api/core';

import * as pluginTokens from './plugin-tokens.js';

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
    // regex used by node-tap
    // ((\/|^)(tests?|__tests?__)\/.*|\.(tests?|spec)|^\/?tests?)\.([mc]js|[jt]sx?)$
    // todo make async and fix the glob pattern
    this.testFiles = glob.sync('**/+(tests|__tests__)/**/*.js');
  }

  public async dryRun(options: DryRunOptions): Promise<DryRunResult> {
    return this.run(options.disableBail);
  }

  public async mutantRun(options: MutantRunOptions): Promise<MutantRunResult> {
    return toMutantRunResult(await this.run(options.disableBail, options.testFilter, options.activeMutant.id, options.hitLimit));
  }

  private async run(disableBail: boolean, testFilter?: string[], activeMutant?: string, hitLimit?: number): Promise<DryRunResult> {
    try {
      const testFiles = testFilter ?? this.testFiles;

      // todo: bail all processes if one fails
      const runs: TestResult[] = await Promise.all(testFiles.map((testFile) => this.runFile(testFile, disableBail, activeMutant, hitLimit)));

      return {
        status: DryRunStatus.Complete,
        tests: runs,
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

  private async runFile(testFile: string, disableBail: boolean, activeMutant?: string, hitLimit?: number): Promise<TestResult> {
    // todo reject if exit code is not 0
    return new Promise<TestResult>((resolve) => {
      const env: NodeJS.ProcessEnv = {
        ...process.env,
        ['__stryker__hit-limit']: hitLimit?.toString(),
        ['__stryker__namespace']: this.globalNamespace,
        [INSTRUMENTER_CONSTANTS.ACTIVE_MUTANT_ENV_VARIABLE]: activeMutant,
      };
      const tapProcess = spawn('node', ['-r', TapTestRunner.hookFile, testFile], { env });

      const fails: tap.TapError[] = [];
      const config = { bail: !disableBail };

      const parser = new tap.Parser(config, async (result) => {
        const fileName = `stryker-output-${tapProcess.pid}.json`;
        const fileContent = await readFile(fileName, 'utf-8');
        await rm(fileName);
        const file = JSON.parse(fileContent);

        const hitLimitReached = determineHitLimitReached(+file.Count, hitLimit);
        if (!disableBail && hitLimitReached) {
          throw new HitLimitError(hitLimitReached.reason);
        }

        resolve(this.tapResultToTestResult(testFile, result, fails));
      });

      parser.on('bailout', () => {
        // todo enable this, but it does not create an output file (on windows at least)
        // tapProcess.kill();
      });

      parser.on('fail', (reason: tap.TapError) => {
        fails.push(reason);
      });

      tapProcess.stdout.pipe(parser);
    });
  }

  private tapResultToTestResult(fileName: string, result: tap.FinalResults, fails: tap.TapError[]): TestResult {
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
        failureMessage: fails.map((f) => `${f.fullname}: ${f.name}`).join(', '),
      };
    }
  }
}
