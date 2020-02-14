import { exec } from 'child_process';
import * as os from 'os';

import { StrykerOptions } from '@stryker-mutator/api/core';
import { RunOptions, RunResult, RunStatus, TestRunner, TestStatus } from '@stryker-mutator/api/test_runner';
import { errorToString } from '@stryker-mutator/util';

import { kill } from '../utils/objectUtils';
import Timer from '../utils/Timer';

type CommandFunction = (runOptions: RunOptions) => string;

export interface CommandRunnerSettings {
  command: string | CommandFunction;
}

/**
 * A test runner that uses a (bash or cmd) command to execute the tests.
 * Does not know hom many tests are executed or any code coverage results,
 * instead, it mimics a simple test result based on the exit code.
 * The command can be configured, but defaults to `npm test`.
 */
export default class CommandTestRunner implements TestRunner {
  /**
   * "command"
   */
  public static readonly runnerName = CommandTestRunner.name.replace('TestRunner', '').toLowerCase();

  /**
   * Determines whether a given name is "command" (ignore case)
   * @param name Maybe "command", maybe not
   */
  public static is(name: string): boolean {
    return this.runnerName === name.toLowerCase();
  }

  private readonly settings: CommandRunnerSettings;

  private timeoutHandler: undefined | (() => Promise<void>);

  constructor(private readonly workingDir: string, options: StrykerOptions) {
    this.settings = Object.assign(
      {
        command: 'npm test'
      },
      options.commandRunner
    );
  }

  public run(runOptions: RunOptions): Promise<RunResult> {
    return new Promise((res, rej) => {
      const command = typeof this.settings.command === 'string' ? this.settings.command : this.settings.command(runOptions);
      const timer = new Timer();
      const output: Array<string | Buffer> = [];
      const childProcess = exec(command, { cwd: this.workingDir });
      childProcess.on('error', error => {
        kill(childProcess.pid)
          .then(() => handleResolve(errorResult(error)))
          .catch(rej);
      });
      childProcess.on('exit', code => {
        const result = completeResult(code, timer);
        handleResolve(result);
      });
      childProcess.stdout.on('data', chunk => {
        output.push(chunk);
      });
      childProcess.stderr.on('data', chunk => {
        output.push(chunk);
      });

      this.timeoutHandler = async () => {
        handleResolve({ status: RunStatus.Timeout, tests: [] });
        await kill(childProcess.pid);
      };

      const handleResolve = (runResult: RunResult) => {
        removeAllListeners();
        this.timeoutHandler = undefined;
        res(runResult);
      };

      function removeAllListeners() {
        childProcess.stderr.removeAllListeners();
        childProcess.stdout.removeAllListeners();
        childProcess.removeAllListeners();
      }

      function errorResult(error: Error): RunResult {
        return {
          errorMessages: [errorToString(error)],
          status: RunStatus.Error,
          tests: []
        };
      }

      function completeResult(exitCode: number | null, timer: Timer): RunResult {
        const duration = timer.elapsedMs();
        if (exitCode === 0) {
          return {
            status: RunStatus.Complete,
            tests: [
              {
                name: 'All tests',
                status: TestStatus.Success,
                timeSpentMs: duration
              }
            ]
          };
        } else {
          return {
            status: RunStatus.Complete,
            tests: [
              {
                failureMessages: [output.map(buf => buf.toString()).join(os.EOL)],
                name: 'All tests',
                status: TestStatus.Failed,
                timeSpentMs: duration
              }
            ]
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
