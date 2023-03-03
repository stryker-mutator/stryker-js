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

tapTestRunnerFactory.inject = [commonTokens.injector];
export function tapTestRunnerFactory(injector: Injector<PluginContext>): TapTestRunner {
  return injector.injectClass(TapTestRunner);
}

export class TapTestRunner implements TestRunner {
  public static inject = tokens(commonTokens.logger, commonTokens.options);
  private testFiles: string[] = [];
  private static readonly hookFile = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'setup', 'hook.cjs');

  constructor(private readonly logger: Logger, private readonly options: StrykerOptions) {}

  public capabilities(): Promise<TestRunnerCapabilities> | TestRunnerCapabilities {
    return { reloadEnvironment: false };
  }

  public async init(): Promise<void> {
    // regex from node-tap
    // ((\/|^)(tests?|__tests?__)\/.*|\.(tests?|spec)|^\/?tests?)\.([mc]js|[jt]sx?)$
    // todo make async and fix the glob pattern
    this.testFiles = glob.sync('**/+(tests|__tests__)/**/*.js');
  }

  public async dryRun(options: DryRunOptions): Promise<DryRunResult> {
    return this.run(options.disableBail, undefined, undefined, true);
  }

  public async mutantRun(options: MutantRunOptions): Promise<MutantRunResult> {
    return toMutantRunResult(await this.run(options.disableBail, options.testFilter, options.activeMutant.id));
  }

  private async run(disableBail: boolean, testFilter?: string[], activeMutant?: string, isDryRun = false): Promise<DryRunResult> {
    try {
      const testFiles = testFilter ?? this.testFiles;
      // const runs: TestResult[] = await Promise.all(testFiles.map((testFile) => this.runFile(testFile, disableBail, isDryRun, activeMutant)));

      const runs: TestResult[] = [];
      for (const testFile of testFiles) {
        runs.push(await this.runFile(testFile, disableBail, isDryRun));
      }

      return {
        status: DryRunStatus.Complete,
        tests: runs,
      };
    } catch (e) {
      return {
        status: DryRunStatus.Error,
        errorMessage: (e as Error).message,
      };
    }
  }

  private async runFile(testFile: string, disableBail: boolean, isDryRun: boolean, activeMutant?: string): Promise<TestResult> {
    const hitLimit = 10; // todo get limit from options

    // todo reject if exit code is not 0
    return new Promise<TestResult>((resolve) => {
      const env: NodeJS.ProcessEnv = {
        ...process.env,
        ['__stryker__is-dry-run']: isDryRun.toString(),
        ['__stryker__hit-limit']: hitLimit.toString(),
        [INSTRUMENTER_CONSTANTS.ACTIVE_MUTANT_ENV_VARIABLE]: activeMutant,
      };
      const tapProcess = spawn('node', ['-r', TapTestRunner.hookFile, testFile], { env });

      const fails: tap.TapError[] = [];
      const config = { bail: !disableBail };
      const parser = new tap.Parser(config, async (result) => {
        if (isDryRun) {
          const fileName = `stryker-output-${tapProcess.pid}.json`;
          const fileContent = await readFile(fileName, 'utf-8');
          await rm(fileName);
          const file = JSON.parse(fileContent);

          if (this.options.hitLimit) {
            const res = determineHitLimitReached(+file.Count, hitLimit);
            if (res) {
              // todo
            }
          }
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
