import { AdapterMessage, RunMessage, StartMessage, ResultMessage, EmptyWorkerMessage, WorkerMessage } from './MessageProtocol';
import { RunnerOptions, TestRunner, RunStatus, TestRunnerFactory, RunResult } from 'stryker-api/test_runner';
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
    // If the test runner didn't report on coverage, let's try to do it ourselves.
    if (!result.coverage) {
      result.coverage = (Function('return this'))().__coverage__;
    }
    if (result.errorMessages) {
      // errorMessages should be a string[]
      // Just in case the test runner implementer forgot to convert `Error`s to string, we will do it here
      // https://github.com/stryker-mutator/stryker/issues/141
      result.errorMessages = result.errorMessages.map((error: any) => {
        if (error instanceof Error) {
          return `${error.name}: ${error.message}\n${error.stack.toString()}`;
        } else {
          return error.toString();
        }
      });
    }
    this.send({
      kind: 'result',
      result
    });
  }

  private reportErrorResult(error: any) {
    const runResult: RunResult = {
      tests: [],
      status: RunStatus.Error,
    };
    if (error) {
      if (Array.isArray(error)) {
        runResult.errorMessages = error.map((e: any) => e);
      } else {
        runResult.errorMessages = [error];
      }
    }
    this.reportResult(runResult);
  }
}

new TestRunnerChildProcessAdapterWorker();