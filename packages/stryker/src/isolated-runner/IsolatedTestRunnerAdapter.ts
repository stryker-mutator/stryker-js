import { EventEmitter } from 'events';
import * as log4js from 'log4js';
import * as _ from 'lodash';
import { fork, ChildProcess } from 'child_process';
import { TestRunner, RunResult, RunOptions } from 'stryker-api/test_runner';
import { serialize } from '../utils/objectUtils';
import { AdapterMessage, WorkerMessage } from './MessageProtocol';
import IsolatedRunnerOptions from './IsolatedRunnerOptions';
import Task from '../utils/Task';
const MAX_WAIT_FOR_DISPOSE = 2000;

const log = log4js.getLogger('IsolatedTestRunnerAdapter');

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

  private workerProcess: ChildProcess;
  private currentTask: WorkerTask;

  constructor(private realTestRunnerName: string, private options: IsolatedRunnerOptions) {
    super();
    this.startWorker();
  }

  private startWorker() {
    // Remove --debug-brk from process arguments. 
    // When debugging, it will try to reuse the same debug port, which will be taken by the main process.
    let execArgv = _.clone(process.execArgv);
    _.remove(execArgv, arg => arg.substr(0, 11) === '--debug-brk');
    this.workerProcess = fork(`${__dirname}/IsolatedTestRunnerAdapterWorker`, [], { silent: true, execArgv });
    this.sendStartCommand();
    this.listenToWorkerProcess();
  }

  private listenToWorkerProcess() {

    if (this.workerProcess.stdout) {
      let traceEnabled = log.isTraceEnabled();
      this.workerProcess.stdout.on('data', (data: Buffer) => {
        if (traceEnabled) {
          log.trace(data.toString());
        }
      });
    }
    if (this.workerProcess.stderr) {
      this.workerProcess.stderr.on('data', (data: any) => {
        log.error(data.toString());
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
            this.currentTask.resolve(undefined);
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
  }

  private logReceivedUnexpectedMessageWarning(message: WorkerMessage) {
    log.warn(`Received unexpected message from test runner worker process: "${message.kind}" while current task is ${this.currentTask.kind}. Ignoring this message.`);
  }

  private logReceivedMessageWarning(message: never) {
    log.error(`Retrieved unrecognized message from child process: ${JSON.stringify(message)}`);
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

  dispose(): Promise<undefined> {
    this.currentTask = new DisposeTask(MAX_WAIT_FOR_DISPOSE);
    this.sendDisposeCommand();
    return this.currentTask.promise
      .then(() => this.workerProcess.kill());
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