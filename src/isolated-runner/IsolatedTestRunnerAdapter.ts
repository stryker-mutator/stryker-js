import {TestRunner, RunResult, RunOptions, RunnerOptions, TestResult} from '../api/test_runner';
import {StrykerOptions} from '../api/core';
import {fork, ChildProcess} from 'child_process';
import Message, {MessageType} from './Message';
import StartMessageBody from './StartMessageBody';
import RunMessageBody from './RunMessageBody';
import ResultMessageBody from './ResultMessageBody';

/**
 * Runs the given test runner in a child process and forwards reports about test results
 * Will also implement timeouts 
 */
export default class TestRunnerChildProcessAdapter extends TestRunner {

  private workerProcess: ChildProcess;
  private currentPromiseFulfill: (result: RunResult) => void;
  private inRunningState: boolean;

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
    this.inRunningState = true;
    if (options.timeout) {
      this.markNoResultTimeout(options.timeout);
    }
    return new Promise<RunResult>(res => {
      this.currentPromiseFulfill = res;
      this.sendRunCommand(options);
    });
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
    this.inRunningState = false;
    this.currentPromiseFulfill(message.body.result);
  }

  private markNoResultTimeout(timeoutMs: number) {
    setTimeout(() => {
      if (this.inRunningState) {
        this.handleTimeout();
      }
    }, timeoutMs);
  }

  private handleTimeout() {
    this.workerProcess.kill();
    this.startWorker();
    this.currentPromiseFulfill({ result: TestResult.Timeout });
  }
}