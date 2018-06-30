import { EventEmitter } from 'events';
import { getLogger } from 'log4js';
import * as _ from 'lodash';
import { fork, ChildProcess } from 'child_process';
import { TestRunner, RunResult, RunOptions } from 'stryker-api/test_runner';
import { serialize, kill } from '../utils/objectUtils';
import { AdapterMessage, WorkerMessage } from './MessageProtocol';
import IsolatedRunnerOptions from './IsolatedRunnerOptions';
import Task from '../utils/Task';

const MAX_WAIT_FOR_DISPOSE = 2000;

class InitTask extends Task<void> {
  readonly kind = 'init';
}
class DisposeTask extends Task<void> {
  readonly kind = 'dispose';
}
class RunTask extends Task<RunResult> {
  readonly kind = 'run';
}
type WorkerTask = InitTask | DisposeTask | RunTask;


/**
 * Runs the given test runner in a child process and forwards reports about test results
 * Also implements timeout-mechanism (on timeout, restart the child runner and report timeout) 
 */
export default class TestRunnerChildProcessAdapter extends EventEmitter implements TestRunner {

  private readonly log = getLogger(TestRunnerChildProcessAdapter.name);
  private workerProcess: ChildProcess;
  private currentTask: WorkerTask;
  private lastMessagesQueue: string[] = [];

  constructor(private realTestRunnerName: string, private options: IsolatedRunnerOptions) {
    super();
    this.startWorker();
  }

  private startWorker() {
    // Remove --debug-brk from process arguments. 
    // When debugging, it will try to reuse the same debug port, which will be taken by the main process.
    let execArgv = _.clone(process.execArgv);
    _.remove(execArgv, arg => arg.substr(0, 11) === '--debug-brk');
    this.workerProcess = fork(`${__dirname}/IsolatedTestRunnerAdapterWorker`, [], { silent: true, execArgv: [] });
    this.sendStartCommand();
    this.listenToWorkerProcess();
  }

  private listenToWorkerProcess() {

    if (this.workerProcess.stdout) {
      let traceEnabled = this.log.isTraceEnabled();
      this.workerProcess.stdout.on('data', (data: Buffer) => {
        const msg = data.toString();

        this.lastMessagesQueue.push(msg);
        if (this.lastMessagesQueue.length > 10) {
          this.lastMessagesQueue.shift();
        }

        if (traceEnabled) {
          this.log.trace(msg);
        }
      });
    }

    if (this.workerProcess.stderr) {
      this.workerProcess.stderr.on('data', (data: any) => {
        this.log.error(data.toString());
      });
    }

    this.workerProcess.on('message', (message: WorkerMessage) => {
      switch (message.kind) {
        case 'result':
          if (this.currentTask.kind === 'run') {
            this.currentTask.resolve(message.result);
          } else {
            this.logReceivedUnexpectedMessageWarning(message);
          }
          break;
        case 'initDone':
          if (this.currentTask.kind === 'init') {
            if (message.errorMessage) {
              this.currentTask.reject(message.errorMessage);
            } else {
              this.currentTask.resolve(undefined);
            }
          } else {
            this.logReceivedUnexpectedMessageWarning(message);
          }
          break;
        case 'disposeDone':
          if (this.currentTask.kind === 'dispose') {
            this.currentTask.resolve(undefined);
          } else {
            this.logReceivedUnexpectedMessageWarning(message);
          }
          break;
        default:
          this.logReceivedMessageWarning(message);
          break;
      }
    });

    this.workerProcess.on('exit', (code: number | null, signal: string) => {
      if (code !== 0 && code !== null) {
        this.log.error(`Child process exited with non-zero exit code ${code}. Last 10 message from the child process were: \r\n${this.lastMessagesQueue.map(msg => `\t${msg}`).join('\r\n')}`);
        if (this.currentTask) {
          this.currentTask.reject(`Test runner child process exited with non-zero exit code ${code}`);
        }
      }
    });
  }

  private logReceivedUnexpectedMessageWarning(message: WorkerMessage) {
    this.log.warn(`Received unexpected message from test runner worker process: "${message.kind}" while current task is ${this.currentTask.kind}. Ignoring this message.`);
  }

  private logReceivedMessageWarning(message: never) {
    this.log.error(`Retrieved unrecognized message from child process: ${JSON.stringify(message)}`);
  }

  init(): Promise<any> {
    this.currentTask = new InitTask();
    this.sendInitCommand();
    return this.currentTask.promise;
  }

  run(options: RunOptions): Promise<RunResult> {
    this.currentTask = new RunTask();
    this.sendRunCommand(options);
    return this.currentTask.promise;
  }

  dispose(): Promise<void> {
    this.currentTask = new DisposeTask(MAX_WAIT_FOR_DISPOSE);
    this.sendDisposeCommand();
    return this.currentTask.promise
      .then(() => kill(this.workerProcess.pid));
  }

  private sendRunCommand(options: RunOptions) {
    this.send({
      kind: 'run',
      runOptions: options
    });
  }

  private send(message: AdapterMessage) {
    try {
      // Serialize message before sending to preserve all javascript, including regex's and functions
      // See https://github.com/stryker-mutator/stryker/issues/143
      this.workerProcess.send(serialize(message));
    } catch (error) {
      this.currentTask.reject(error);
    }
  }

  private sendStartCommand() {
    this.send({
      kind: 'start',
      runnerName: this.realTestRunnerName,
      runnerOptions: this.options
    });
  }

  private sendInitCommand() {
    this.send({ kind: 'init' });
  }

  private sendDisposeCommand() {
    this.send({ kind: 'dispose' });
  }
}