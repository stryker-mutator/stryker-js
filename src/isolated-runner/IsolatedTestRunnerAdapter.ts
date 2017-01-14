import { EventEmitter } from 'events';
import * as log4js from 'log4js';
import * as _ from 'lodash';
import { fork, ChildProcess } from 'child_process';
import { TestRunner, RunResult, RunOptions, TestResult, RunStatus } from 'stryker-api/test_runner';
import { StrykerOptions } from 'stryker-api/core';
import { serialize } from '../utils/objectUtils';
import { AdapterMessage, WorkerMessage } from './MessageProtocol';
import IsolatedRunnerOptions from './IsolatedRunnerOptions';

const log = log4js.getLogger('IsolatedTestRunnerAdapter');
const MAX_WAIT_FOR_DISPOSE = 2000;

/**
 * Runs the given test runner in a child process and forwards reports about test results
 * Also implements timeout-mechanism (on timeout, restart the child runner and report timeout) 
 */
export default class TestRunnerChildProcessAdapter extends EventEmitter implements TestRunner {

  private workerProcess: ChildProcess;
  private initTask: Task<void>;
  private runTask: Task<RunResult>;
  private disposeTask: Task<undefined>;

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
          if (!this.disposeTask || this.disposeTask.isResolved) {
            this.runTask.resolve(message.result);
          }
          break;
        case 'initDone':
          this.initTask.resolve(null);
          break;
        case 'disposeDone':
          this.disposeTask.resolve(null);
          break;
        default:
          this.logReceivedMessageWarning(message);
          break;
      }
    });
  }

  private logReceivedMessageWarning(message: never) {
    log.error(`Retrieved unrecognized message from child process: ${JSON.stringify(message)}`);
  }

  init(): Promise<any> {
    this.initTask = new Task<void>();
    this.sendInitCommand();
    return this.initTask.promise;
  }

  run(options: RunOptions): Promise<RunResult> {
    this.runTask = new Task<RunResult>(options.timeout, () => {
      this.handleTimeout();
    });
    this.sendRunCommand(options);
    return this.runTask.promise;
  }

  dispose(): Promise<undefined> {
    if (this.disposeTask && !this.disposeTask.isResolved) {
      return this.disposeTask.promise;
    } else {
      this.disposeTask = new Task<undefined>(MAX_WAIT_FOR_DISPOSE, () => {
        log.warn(`Test runner did not respond to dispose command within ${MAX_WAIT_FOR_DISPOSE}ms, force killing the process at "${this.options.sandboxWorkingFolder}".`);
        this.disposeTask.resolve(undefined);
      });
      this.sendDisposeCommand();
      return this.disposeTask.promise
        .then(() => this.workerProcess.kill());
    }
  }

  private sendRunCommand(options: RunOptions) {
    this.send({
      kind: 'run',
      runOptions: options
    });
  }

  private send<T>(message: AdapterMessage) {
    // Serialize message before sending to preserve all javascript, including regexes and functions
    // See https://github.com/stryker-mutator/stryker/issues/143
    this.workerProcess.send(serialize(message));
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

  private handleTimeout() {
    return this.dispose()
      .then(() => this.startWorker())
      .then(() => this.init())
      .then(() => this.runTask.resolve({ status: RunStatus.Timeout, tests: [] }));
  }
}


class Task<T> {

  private _promise: Promise<T>;
  private resolveFn: (value?: T | PromiseLike<T>) => void;
  private _isResolved = false;
  private timeout: NodeJS.Timer;

  constructor(timeoutMs?: number, private timeoutHandler?: () => void) {
    this._promise = new Promise<T>((resolve, reject) => {
      this.resolveFn = resolve;
    });
    if (timeoutMs) {
      this.timeout = setTimeout(() => this.handleTimeout(), timeoutMs);
    }
  }

  get isResolved() {
    return this._isResolved;
  }

  get promise() {
    return this._promise;
  }

  handleTimeout() {
    if (this.timeoutHandler) {
      this.timeoutHandler();
    }
  }

  resolve(result: T | PromiseLike<T>) {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this._isResolved = true;
    this.resolveFn(result);
  }
}