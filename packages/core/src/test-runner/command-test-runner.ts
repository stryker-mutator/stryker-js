import { exec } from 'child_process';
import os from 'os';

import {
  StrykerOptions,
  CommandRunnerOptions,
  INSTRUMENTER_CONSTANTS,
} from '@stryker-mutator/api/core';
import {
  TestRunner,
  TestStatus,
  MutantRunOptions,
  DryRunResult,
  MutantRunResult,
  DryRunStatus,
  ErrorDryRunResult,
  CompleteDryRunResult,
  toMutantRunResult,
  TestRunnerCapabilities,
} from '@stryker-mutator/api/test-runner';
import { errorToString } from '@stryker-mutator/util';

import { objectUtils } from '../utils/object-utils.js';
import { Timer } from '../utils/timer.js';

/**
 * A test runner that uses a (bash or cmd) command to execute the tests.
 * Does not know hom many tests are executed or any code coverage results,
 * instead, it mimics a simple test result based on the exit code.
 * The command can be configured, but defaults to `npm test`.
 */
export class CommandTestRunner implements TestRunner {
  /**
   * "command"
   */
  public static readonly runnerName = CommandTestRunner.name
    .replace('TestRunner', '')
    .toLowerCase();

  /**
   * Determines whether a given name is "command" (ignore case)
   * @param name Maybe "command", maybe not
   */
  public static is(name: string): name is 'command' {
    return this.runnerName === name.toLowerCase();
  }

  private readonly settings: CommandRunnerOptions;

  private timeoutHandler: (() => Promise<void>) | undefined;

  constructor(
    private readonly workingDir: string,
    options: StrykerOptions,
  ) {
    this.settings = options.commandRunner;
  }

  public capabilities(): TestRunnerCapabilities {
    // Can reload, because each call is a new process.
    return { reloadEnvironment: true };
  }

  public async dryRun(): Promise<DryRunResult> {
    return this.run({});
  }

  public async mutantRun({
    activeMutant,
  }: Pick<MutantRunOptions, 'activeMutant'>): Promise<MutantRunResult> {
    const result = await this.run({ activeMutantId: activeMutant.id });
    return toMutantRunResult(result);
  }

  private run({
    activeMutantId,
  }: {
    activeMutantId?: string;
  }): Promise<DryRunResult> {
    const timerInstance = new Timer();
    return new Promise((res, rej) => {
      const output: Array<Buffer | string> = [];
      const env =
        activeMutantId === undefined
          ? process.env
          : {
              ...process.env,
              [INSTRUMENTER_CONSTANTS.ACTIVE_MUTANT_ENV_VARIABLE]:
                activeMutantId,
            };
      const childProcess = exec(this.settings.command, {
        cwd: this.workingDir,
        env,
      });
      childProcess.on('error', (error) => {
        objectUtils
          .kill(childProcess.pid)
          .then(() => handleResolve(errorResult(error)))

          .catch(rej);
      });
      childProcess.on('exit', (code) => {
        const result = completeResult(code, timerInstance);
        handleResolve(result);
      });
      childProcess.stdout!.on('data', (chunk) => {
        output.push(chunk as Buffer);
      });
      childProcess.stderr!.on('data', (chunk) => {
        output.push(chunk as Buffer);
      });

      this.timeoutHandler = async () => {
        handleResolve({ status: DryRunStatus.Timeout });
        await objectUtils.kill(childProcess.pid);
      };

      const handleResolve = (runResult: DryRunResult) => {
        removeAllListeners();
        this.timeoutHandler = undefined;
        res(runResult);
      };

      function removeAllListeners() {
        childProcess.stderr!.removeAllListeners();
        childProcess.stdout!.removeAllListeners();
        childProcess.removeAllListeners();
      }

      function errorResult(error: Error): ErrorDryRunResult {
        return {
          errorMessage: errorToString(error),
          status: DryRunStatus.Error,
        };
      }

      function completeResult(
        exitCode: number | null,
        timer: Timer,
      ): CompleteDryRunResult {
        const duration = timer.elapsedMs();
        if (exitCode === 0) {
          return {
            status: DryRunStatus.Complete,
            tests: [
              {
                id: 'all',
                name: 'All tests',
                status: TestStatus.Success,
                timeSpentMs: duration,
              },
            ],
          };
        } else {
          return {
            status: DryRunStatus.Complete,
            tests: [
              {
                id: 'all',
                failureMessage: output
                  .map((buf) => buf.toString())
                  .join(os.EOL),
                name: 'All tests',
                status: TestStatus.Failed,
                timeSpentMs: duration,
              },
            ],
          };
        }
      }
    });
  }
  public async dispose(): Promise<void> {
    if (this.timeoutHandler) {
      await this.timeoutHandler();
    }
  }
}
