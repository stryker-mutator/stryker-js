import Message, {MessageType} from './Message';
import {RunnerOptions, TestRunner, TestResult, TestRunnerFactory, RunResult} from 'stryker-api/test_runner';
import StartMessageBody from './StartMessageBody';
import RunMessageBody from './RunMessageBody';
import ResultMessageBody from './ResultMessageBody';
import PluginLoader from '../PluginLoader';
import * as log4js from 'log4js';
import {isPromise, deserialize} from '../utils/objectUtils';

const log = log4js.getLogger('TestRunnerChildProcessAdapterWorker');

class TestRunnerChildProcessAdapterWorker {

  private underlyingTestRunner: TestRunner;

  constructor() {
    this.listenToMessages();
  }

  listenToMessages() {
    process.on('message', (serializedMessage: string) => {
      let message: Message<any> = deserialize(serializedMessage);
      switch (message.type) {
        case MessageType.Start:
          this.start(message.body);
          break;
        case MessageType.Run:
          this.run(message.body);
          break;
        case MessageType.Init:
          this.init();
          break;
        case MessageType.Dispose:
          this.dispose();
          break;
        default:
          log.warn('Received unsupported message: {}', JSON.stringify(message));
      }
    });
  }

  start(body: StartMessageBody) {
    this.loadPlugins(body.runnerOptions.strykerOptions.plugins);
    this.underlyingTestRunner = TestRunnerFactory.instance().create(body.runnerName, body.runnerOptions);
  }

  init() {
    let initPromise: Promise<any> | void = void 0;
    if (this.underlyingTestRunner.init) {
      initPromise = this.underlyingTestRunner.init();
    }
    if (isPromise(initPromise)) {
      initPromise.then(this.sendInitDone);
    } else {
      this.sendInitDone();
    }
  }

  sendInitDone() {
    process.send({ type: MessageType.InitDone });
  }

  dispose() {
    let disposePromise: Promise<any> | void = void 0;
    if (this.underlyingTestRunner.dispose) {
      disposePromise = this.underlyingTestRunner.dispose();
    }
    if (isPromise(disposePromise)) {
      disposePromise.then(this.sendDisposeDone);
    } else {
      this.sendDisposeDone();
    }
  }

  sendDisposeDone() {
    process.send({ type: MessageType.DisposeDone });
  }

  run(body: RunMessageBody) {
    this.underlyingTestRunner.run(body.runOptions).then(this.reportResult, this.reportErrorResult);
  }

  private loadPlugins(plugins: string[]) {
    new PluginLoader(plugins).load();
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
          testNames: [],
          result: TestResult.Error,
        }
      }
    };
    process.send(message);
  }
}

new TestRunnerChildProcessAdapterWorker();