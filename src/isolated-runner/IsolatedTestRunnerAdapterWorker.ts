import { AdapterMessage, RunMessage, StartMessage, EmptyWorkerMessage, WorkerMessage } from './MessageProtocol';
import { TestRunner, RunStatus, TestRunnerFactory, RunResult } from 'stryker-api/test_runner';
import PluginLoader from '../PluginLoader';
import * as log4js from 'log4js';
import { deserialize } from '../utils/objectUtils';

const log = log4js.getLogger('IsolatedTestRunnerAdapterWorker');

class IsolatedTestRunnerAdapterWorker {

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
    this.loadPlugins(message.runnerOptions.strykerOptions.plugins || []);
    log.debug(`Changing current working directory for this process to ${message.runnerOptions.sandboxWorkingFolder}`);
    process.chdir(message.runnerOptions.sandboxWorkingFolder);
    this.underlyingTestRunner = TestRunnerFactory.instance().create(message.runnerName, message.runnerOptions);
  }

  async init() {
    if (this.underlyingTestRunner.init) {
      await this.underlyingTestRunner.init();
    };
    this.sendInitDone();
  }

  sendInitDone() {
    const message: EmptyWorkerMessage = { kind: 'initDone' };
    if (process.send) {
      process.send(message);
    }
  }

  async dispose() {
    if (this.underlyingTestRunner.dispose) {
      await this.underlyingTestRunner.dispose();
    }
    this.sendDisposeDone();
  }

  sendDisposeDone() {
    this.send({ kind: 'disposeDone' });
  }

  async run(body: RunMessage) {
    try {
      let res = await this.underlyingTestRunner.run(body.runOptions);
      this.reportResult(res);
    } catch (error) {
      this.reportErrorResult(error);
    }
  }

  private send(message: WorkerMessage) {
    if (process.send) {
      process.send(message);
    }
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
          return `${error.name}: ${error.message}\n${new String(error.stack).toString()}`;
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

new IsolatedTestRunnerAdapterWorker();