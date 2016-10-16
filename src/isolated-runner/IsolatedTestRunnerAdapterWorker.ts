import { AdapterMessage, RunMessage, StartMessage, ResultMessage, EmptyWorkerMessage, WorkerMessage } from './MessageProtocol';
import { RunnerOptions, TestRunner, RunState, TestRunnerFactory, RunResult } from 'stryker-api/test_runner';
import PluginLoader from '../PluginLoader';
import * as log4js from 'log4js';
import { isPromise, deserialize } from '../utils/objectUtils';

const log = log4js.getLogger('TestRunnerChildProcessAdapterWorker');

class TestRunnerChildProcessAdapterWorker {

  private underlyingTestRunner: TestRunner;

  constructor() {
    this.listenToMessages();
  }

  listenToMessages() {
    process.on('message', (serializedMessage: string) => {
      let message: AdapterMessage = deserialize(serializedMessage);
      switch (message.kind) {
        case 'start':
          this.start(message);
          break;
        case 'run':
          this.run(message);
          break;
        case 'init':
          this.init();
          break;
        case 'dispose':
          this.dispose();
          break;
        default:
          this.logReceivedMessageWarning(message);
      }
    });
  }

  private logReceivedMessageWarning(message: never) {
    log.warn('Received unsupported message: {}', JSON.stringify(message));
  }

  start(message: StartMessage) {
    this.loadPlugins(message.runnerOptions.strykerOptions.plugins);
    this.underlyingTestRunner = TestRunnerFactory.instance().create(message.runnerName, message.runnerOptions);
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
    const message: EmptyWorkerMessage = { kind: 'initDone' };
    process.send(message);
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
    this.send({ kind: 'disposeDone' });
  }

  run(body: RunMessage) {
    this.underlyingTestRunner.run(body.runOptions).then((res) => this.reportResult(res), (error) => this.reportErrorResult(error));
  }

  private send(message: WorkerMessage) {
    process.send(message);
  }

  private loadPlugins(plugins: string[]) {
    new PluginLoader(plugins).load();
  }

  private reportResult(result: RunResult) {
    this.send({
      kind: 'result',
      result
    });
  }

  private reportErrorResult(error: any) {
    const message: ResultMessage = {
      kind: 'result',
      result: {
        tests: [],
        state: RunState.Error,
      }
    };
    if (error) {
      if (Array.isArray(error)) {
        message.result.errorMessages = error.map((e: any) => e.toString());
      } else {
        message.result.errorMessages = [error.toString()];
      }
    }
    this.send(message);
  }
}

new TestRunnerChildProcessAdapterWorker();