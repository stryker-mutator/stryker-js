import { AdapterMessage, RunMessage, StartMessage, WorkerMessage, InitDoneMessage } from './MessageProtocol';
import { TestRunner, RunStatus, TestRunnerFactory, RunResult } from 'stryker-api/test_runner';
import PluginLoader from '../PluginLoader';
import { getLogger } from 'log4js';
import { deserialize, errorToString } from '../utils/objectUtils';

class IsolatedTestRunnerAdapterWorker {

  private readonly log = getLogger(IsolatedTestRunnerAdapterWorker.name);
  private underlyingTestRunner: TestRunner;

  constructor() {
    this.handlePromiseRejections();
    this.listenToMessages();
  }

  private listenToMessages() {
    process.on('message', (serializedMessage: string) => {
      const message = deserialize<AdapterMessage>(serializedMessage);
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

  /**
   * During mutation testing, it's to be expected that promise rejections are not handled synchronously anymore (or not at all)
   * Let's handle those events so future versions of node don't crash
   * See issue 350: https://github.com/stryker-mutator/stryker/issues/350
   */
  private handlePromiseRejections() {
    const unhandledRejections: Promise<any>[] = [];
    process.on('unhandledRejection', (reason, promise) => {
      const unhandledPromiseId = unhandledRejections.push(promise);
      this.log.debug(`UnhandledPromiseRejectionWarning: Unhandled promise rejection (rejection id: ${unhandledPromiseId}): ${reason}`);
    });
    process.on('rejectionHandled', (promise) => {
      const unhandledPromiseId = unhandledRejections.indexOf(promise) + 1;
      this.log.debug(`PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: ${unhandledPromiseId})`);
    });
  }

  private logReceivedMessageWarning(message: never) {
    this.log.warn('Received unsupported message: {}', JSON.stringify(message));
  }

  start(message: StartMessage) {
    this.loadPlugins(message.runnerOptions.strykerOptions.plugins || []);
    this.log.debug(`Changing current working directory for this process to ${message.runnerOptions.sandboxWorkingFolder}`);
    process.chdir(message.runnerOptions.sandboxWorkingFolder);
    this.underlyingTestRunner = TestRunnerFactory.instance().create(message.runnerName, message.runnerOptions);
  }

  async init() {
    if (this.underlyingTestRunner.init) {
      try {
        await this.underlyingTestRunner.init();
      } catch (err) {
        this.sendInitDone(errorToString(err));
      }
    }
    this.sendInitDone();
  }

  sendInitDone(errorMessage: string | null = null) {
    const message: InitDoneMessage = { kind: 'initDone', errorMessage };
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
      result.errorMessages = result.errorMessages.map(errorToString);
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