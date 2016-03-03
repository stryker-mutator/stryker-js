import Message, {MessageType} from './Message';
import {RunnerOptions, TestRunner, TestResult, TestRunnerFactory, RunResult} from '../api/test_runner';
import StartMessageBody from './StartMessageBody';
import RunMessageBody from './RunMessageBody';
import ResultMessageBody from './ResultMessageBody';

// Remove later when we have dynamic plugin system
import '../karma-runner/KarmaTestRunner';


class TestRunnerChildProcessAdapterWorker {

  underlyingTestRunner: TestRunner;

  constructor() {
    this.listenToMessages();
  }

  listenToMessages() {
    process.on('message', (message: Message<any>) => {
      switch (message.type) {
        case MessageType.Start:
          this.start(message.body);
          break;
        case MessageType.Run:
          this.run(message.body);
          break;
      }
    });
  }

  start(body: StartMessageBody) {
    this.loadPlugins(body.runnerOptions.strykerOptions.plugins);
    this.underlyingTestRunner = TestRunnerFactory.instance().create(body.runnerName, body.runnerOptions);
  }

  run(body: RunMessageBody) {
    this.underlyingTestRunner.run(body.runOptions).then(this.reportResult, this.reportErrorResult);
  }

  private loadPlugins(plugins: string[]) {
    if (plugins) {
      plugins.forEach(plugin => require(plugin));
    }
  }

  private reportResult(result: RunResult) {
    let message: Message<ResultMessageBody> = {
      type: MessageType.Result,
      body: { result }
    };
    process.send(message);
  }

  private reportErrorResult(error: any) {
    let message: Message<ResultMessageBody> = {
      type: MessageType.Result,
      body: {
        result: {
          specNames: [],
          result: TestResult.Error,
        }
      }
    };
    process.send(message);
  }
}

new TestRunnerChildProcessAdapterWorker();