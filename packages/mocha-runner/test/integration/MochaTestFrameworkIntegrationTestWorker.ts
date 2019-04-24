import MochaTestRunner from '../../src/MochaTestRunner';
import * as path from 'path';
import { RunResult } from '@stryker-mutator/api/test_runner';
import { testInjector } from '@stryker-mutator/test-helpers';
import { commonTokens } from '@stryker-mutator/api/plugin';

export const AUTO_START_ARGUMENT = '2e164669-acf1-461c-9c05-2be139614de2';

export type ChildMessage = RunMessage;

export interface RunMessage {
  kind: 'run';
  testHooks?: string;
}

export default class MochaTestFrameworkIntegrationTestWorker {
  private readonly sut: MochaTestRunner;

  constructor() {
    testInjector.options.mochaOptions = {
      spec: [
        path.resolve(__dirname, '..', '..', 'testResources', 'sampleProject', 'MyMathSpec.js')
      ]
    };
    this.sut = testInjector.injector
      .provideValue(commonTokens.sandboxFileNames, [
        path.resolve(__dirname, '..', '..', 'testResources', 'sampleProject', 'MyMath.js'),
        path.resolve(__dirname, '..', '..', 'testResources', 'sampleProject', 'MyMathSpec.js')
      ])
      .injectClass(MochaTestRunner);

    this.listenForParentProcess();
    try {
      this.sut.init();
    } catch (err) {
      this.sendError(err);
    }
  }

  public listenForParentProcess() {
    process.on('message', (message: ChildMessage) => {
      this.sut.run({ testHooks: message.testHooks })
        .then(result => this.send(result))
        .catch(error => this.send(error));
    });
  }

  public send(result: RunResult) {
    if (process.send) {
      process.send(result);
    }
  }
  public sendError(error: Error) {
    if (process.send) {
      process.send({ name: error.name, message: error.message, stack: error.stack });
    }
  }
}

if (process.argv.indexOf(AUTO_START_ARGUMENT) >= 0) {
  new MochaTestFrameworkIntegrationTestWorker();
}
