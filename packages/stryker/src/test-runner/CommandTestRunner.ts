import * as os from 'os';
import { TestRunner, RunResult, RunStatus, TestStatus, RunnerOptions } from 'stryker-api/test_runner';
import { exec } from 'child_process';
import { errorToString, kill } from '../utils/objectUtils';
import Timer from '../utils/Timer';

export interface CommandRunnerSettings {
  command: string;
}

/**
 * A test runner that uses a (bash or cmd) command to execute the tests.
 * Does not know hom many tests are executed or any code coverage results,
 * instead, it mimics a simple test result based on the exit code.
 * The command can be configured, but defaults to `npm test`.
 */
export default class CommandTestRunner implements TestRunner {

  private readonly settings: CommandRunnerSettings;

  constructor(private workingDir: string, options: RunnerOptions) {
    this.settings = Object.assign({
      command: 'npm test'
    }, options.strykerOptions.commandRunner);
  }

  run(): Promise<RunResult> {
    return new Promise((res, rej) => {
      const timer = new Timer();
      const output: (string | Buffer)[] = [];
      const childProcess = exec(this.settings.command, { cwd: this.workingDir });
      childProcess.on('error', error => {
        removeAllListeners();
        kill(childProcess.pid)
          .then(() => res(errorResult(error)))
          .catch(rej);
      });
      childProcess.on('exit', code => {
        const result = completeResult(code, timer);
        removeAllListeners();
        res(result);
      });
      childProcess.stdout.on('data', chunk => {
        output.push(chunk);
      });
      childProcess.stderr.on('data', chunk => {
        output.push(chunk);
      });

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

      function completeResult(exitCode: number, timer: Timer): RunResult {
        const duration = timer.elapsedMs();
        if (exitCode === 0) {
          return {
            status: RunStatus.Complete,
            tests: [{
              name: 'All tests',
              status: TestStatus.Success,
              timeSpentMs: duration
            }]
          };
        } else {
          return {
            status: RunStatus.Complete,
            tests: [{
              name: 'All tests',
              status: TestStatus.Failed,
              timeSpentMs: duration,
              failureMessages: [output.map(buf => buf.toString()).join(os.EOL)]
            }]
          };
        }
      }
    });
  }
}