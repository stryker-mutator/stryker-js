import {TestRunner, RunResult, RunOptions, RunnerOptions, TestResult} from 'stryker-api/test_runner';
import {StrykerOptions} from 'stryker-api/core';
import {fork, ChildProcess} from 'child_process';
import Message, {MessageType } from './Message';
import StartMessageBody from './StartMessageBody';
import RunMessageBody from './RunMessageBody';
import ResultMessageBody from './ResultMessageBody';
import * as _ from 'lodash';
import * as log4js from 'log4js';

const log = log4js.getLogger('IsolatedTestRunnerAdapter');
const MAX_WAIT_FOR_DISPOSE = 2000;

/**
 * Runs the given test runner in a child process and forwards reports about test results
 * Also implements timeout-mechanisme (on timeout, restart the child runner and report timeout) 
 */
export default class TestRunnerChildProcessAdapter implements TestRunner {

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

    this.workerProcess.on('message', (message: Message<any>) => {
      this.clearCurrentTimer();
      switch (message.type) {
        case MessageType.Result:
          if (!this.isDisposing) {
            this.handleResultMessage(message);
          }
          break;
        case MessageType.InitDone:
          this.initPromiseFulfillmentCallback();
          break;
        case MessageType.DisposeDone:
          this.disposePromiseFulfillmentCallback();
          break;
        default:
          log.error(`Retrieved unrecognized message from child process: ${JSON.stringify(message)}`)
          break;
      }
    });
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
    let message: Message<RunMessageBody> = {
      type: MessageType.Run,
      body: {
        runOptions: options
      }
    }
    this.workerProcess.send(message);
  }

  private sendStartCommand() {
    let startMessage: Message<StartMessageBody> = {
      type: MessageType.Start,
      body: {
        runnerName: this.realTestRunnerName,
        runnerOptions: this.options
      }
    }
    this.workerProcess.send(startMessage);
  }

  private sendInitCommand() {
    this.workerProcess.send(this.emptyMessage(MessageType.Init));
  }

  private sendDisposeCommand() {
    this.workerProcess.send(this.emptyMessage(MessageType.Dispose));
  }

  private handleResultMessage(message: Message<ResultMessageBody>) {
    message.body.result.timeSpent = (new Date().getTime() - this.currentRunStartedTimestamp.getTime());
    this.runPromiseFulfillmentCallback(message.body.result);
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
      .then(() => this.runPromiseFulfillmentCallback({ result: TestResult.Timeout }))
  }

  private emptyMessage(type: MessageType): Message<void> {
    return { type };
  }
}