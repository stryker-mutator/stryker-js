import { TestRunner, RunResult, RunOptions, RunnerOptions, TestResult, RunStatus } from 'stryker-api/test_runner';
import { StrykerOptions } from 'stryker-api/core';
import { fork, ChildProcess } from 'child_process';
import { AdapterMessage, WorkerMessage } from './MessageProtocol';
import * as _ from 'lodash';
import * as log4js from 'log4js';
import { EventEmitter } from 'events';
import { serialize } from '../utils/objectUtils';

const log = log4js.getLogger('IsolatedTestRunnerAdapter');
const MAX_WAIT_FOR_DISPOSE = 2000;

/**
 * Runs the given test runner in a child process and forwards reports about test results
 * Also implements timeout-mechanisme (on timeout, restart the child runner and report timeout) 
 */
export default class TestRunnerChildProcessAdapter extends EventEmitter implements TestRunner {

  private workerProcess: ChildProcess;
  private initPromiseFulfillmentCallback: () => void;
  private runPromiseFulfillmentCallback: (result: RunResult) => void;
  private disposePromiseFulfillmentCallback: () => void;
  private initPromise: Promise<void>;
  private runPromise: Promise<RunResult>;
  private disposingPromise: Promise<any>;
  private currentTimeoutTimer: NodeJS.Timer;
  private currentRunStartedTimestamp: Date;
  private isDisposing: boolean;

  constructor(private realTestRunnerName: string, private options: RunnerOptions) {
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
      this.clearCurrentTimer();
      switch (message.kind) {
        case 'result':
          if (!this.isDisposing) {
            this.runPromiseFulfillmentCallback(message.result);
          }
          break;
        case 'initDone':
          this.initPromiseFulfillmentCallback();
          break;
        case 'disposeDone':
          this.disposePromiseFulfillmentCallback();
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
    this.initPromise = new Promise<void>(resolve => this.initPromiseFulfillmentCallback = resolve);
    this.sendInitCommand();
    return this.initPromise;
  }

  run(options: RunOptions): Promise<RunResult> {
    this.clearCurrentTimer();
    if (options.timeout) {
      this.markNoResultTimeout(options.timeout);
    }
    this.runPromise = new Promise<RunResult>(resolve => {
      this.runPromiseFulfillmentCallback = resolve;
      this.sendRunCommand(options);
      this.currentRunStartedTimestamp = new Date();
    });
    return this.runPromise;
  }

  dispose(): Promise<any> {
    if (this.isDisposing) {
      return this.disposingPromise;
    } else {
      this.isDisposing = true;
      this.disposingPromise = new Promise(resolve => this.disposePromiseFulfillmentCallback = resolve)
        .then(() => {
          clearTimeout(timer);
          this.workerProcess.kill();
          this.isDisposing = false;
        });
      this.clearCurrentTimer();
      this.sendDisposeCommand();
      let timer = setTimeout(this.disposePromiseFulfillmentCallback, MAX_WAIT_FOR_DISPOSE);
      return this.disposingPromise;
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

  private clearCurrentTimer() {
    if (this.currentTimeoutTimer) {
      clearTimeout(this.currentTimeoutTimer);
    }
  }

  private markNoResultTimeout(timeoutMs: number) {
    this.currentTimeoutTimer = setTimeout(() => {
      this.handleTimeout();
    }, timeoutMs);
  }

  private handleTimeout() {
    this.dispose()
      .then(() => this.startWorker())
      .then(() => this.init())
      .then(() => this.runPromiseFulfillmentCallback({ status: RunStatus.Timeout, tests: [] }));
  }

}