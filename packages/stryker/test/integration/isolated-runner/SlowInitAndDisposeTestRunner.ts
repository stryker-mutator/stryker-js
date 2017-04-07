import { EventEmitter } from 'events';
import { TestRunnerFactory, TestRunner, RunOptions, RunStatus } from 'stryker-api/test_runner';

class SlowInitAndDisposeTestRunner extends EventEmitter implements TestRunner {

  inInit: boolean;

  init() {
    return new Promise<void>(resolve => {
      this.inInit = true;
      setTimeout(() => {
        this.inInit = false;
        resolve();
      }, 1000);
    });
  }

  run(options: RunOptions) {
    if (this.inInit) {
      throw new Error('Test should fail! Not yet initialized!');
    }
    return Promise.resolve({ status: RunStatus.Complete, tests: [] });
  }

  dispose() {
    return this.init();
  }
}

TestRunnerFactory.instance().register('slow-init-dispose', SlowInitAndDisposeTestRunner);