import {TestRunner, RunResult, RunOptions, RunnerOptions, TestResult} from '../api/test_runner';
import {StrykerOptions} from '../api/core';
import {fork, ChildProcess} from 'child_process';
import Message, {MessageType} from './Message';
import StartMessageBody from './StartMessageBody';
import RunMessageBody from './RunMessageBody';
import ResultMessageBody from './ResultMessageBody';

/**
 * Runs the given test runner in a child process and forwards reports about test results
 * Also implements timeout-mechanisme (on timeout, restart the child runner and report timeout) 
 */
export default class TestRunnerChildProcessAdapter extends TestRunner {

  private workerProcess: ChildProcess;
  private currentPromiseFulfillmentCallback: (result: RunResult) => void;
  private currentPromise: Promise<RunResult>;
  private currentRunIndex = 0;

  constructor(private realTestRunnerName: string, runnerOptions: RunnerOptions) {
    super(runnerOptions);
    this.startWorker();
  }
  
  private startWorker() {
    this.workerProcess = fork(`${__dirname}/IsolatedTestRunnerAdapterWorker`, [], { silent: true });
    this.sendStartCommand();
    this.listenToWorkerProcess();
  }

  private listenToWorkerProcess() {
    this.workerProcess.on('message', (message: Message<any>) => {
      switch (message.type) {
        case MessageType.Result:
          this.handleResultMessage(message);
          break;
      }
    });
  }

  run(options: RunOptions): Promise<RunResult> {
    this.currentRunIndex++;
    if (options.timeout) {
      this.markNoResultTimeout(options.timeout, this.currentRunIndex);
    }
    this.currentPromise = new Promise<RunResult>(resolve => {
      this.currentPromiseFulfillmentCallback = resolve;
      this.sendRunCommand(options);
    });
    return this.currentPromise;
  }
  
  dispose(){
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
    this.currentPromiseFulfillmentCallback(message.body.result);
  }

  private markNoResultTimeout(timeoutMs: number, forRunIndex: number) {
    setTimeout(() => {
      // See if the current run was not already resolved
      if (this.currentRunIndex === forRunIndex && !this.currentPromise.isFulfilled) {
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