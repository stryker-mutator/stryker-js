import {TestRunner, RunResult, RunOptions, RunnerOptions, TestResult} from '../api/test_runner';
import {StrykerOptions} from '../api/core';
import {fork, ChildProcess} from 'child_process';
import Message, {MessageType} from './Message';
import StartMessageBody from './StartMessageBody';
import RunMessageBody from './RunMessageBody';
import ResultMessageBody from './ResultMessageBody';
import * as _ from 'lodash';

/**
 * Runs the given test runner in a child process and forwards reports about test results
 * Also implements timeout-mechanisme (on timeout, restart the child runner and report timeout) 
 */
export default class TestRunnerChildProcessAdapter extends TestRunner {

  private workerProcess: ChildProcess;
  private currentPromiseFulfillmentCallback: (result: RunResult) => void;
  private currentPromise: Promise<RunResult>;
  private currentInteractionCount = 0;
  private currentRunStartedTimestamp: Date;

  constructor(private realTestRunnerName: string, runnerOptions: RunnerOptions) {
    super(runnerOptions);
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
    this.workerProcess.on('message', (message: Message<any>) => {
      this.currentInteractionCount++;
      switch (message.type) {
        case MessageType.Result:
          this.handleResultMessage(message);
          break;
        default:
          console.error(`Retrieved unrecognized message from child process: ${JSON.stringify(message)}`)
          break;
      }
    });
  }

  run(options: RunOptions): Promise<RunResult> {
    this.currentInteractionCount++;
    if (options.timeout) {
      this.markNoResultTimeout(options.timeout, this.currentInteractionCount);
    }
    this.currentPromise = new Promise<RunResult>(resolve => {
      this.currentPromiseFulfillmentCallback = resolve;
      this.sendRunCommand(options);
      this.currentRunStartedTimestamp = new Date();
    });
    return this.currentPromise;
  }

  dispose() {
    this.currentInteractionCount++;
    this.workerProcess.kill();
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

  private handleResultMessage(message: Message<ResultMessageBody>) {
    message.body.result.timeSpent = (new Date().getTime() - this.currentRunStartedTimestamp.getTime());
    this.currentPromiseFulfillmentCallback(message.body.result);
  }

  private markNoResultTimeout(timeoutMs: number, forInteractionNumber: number) {
    setTimeout(() => {
      // See if the current run was not already resolved
      if (this.currentInteractionCount === forInteractionNumber && !this.currentPromise.isFulfilled) {
        console.log('TIMEOUT occurred, restarting test runner', this.realTestRunnerName);
        this.handleTimeout();
      }
    }, timeoutMs);
  }

  private handleTimeout() {
    this.workerProcess.kill();
    this.startWorker();
    this.currentPromiseFulfillmentCallback({ result: TestResult.Timeout });
  }
}