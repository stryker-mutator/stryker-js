import { factory, assertions, testInjector, TempTestDirectorySandbox } from '@stryker-mutator/test-helpers';

import { createVitestTestRunnerFactory, VitestTestRunner } from '../../src/vitest-test-runner.js';

describe('VitestRunner integration', () => {
  let sut: VitestTestRunner;
  let sandbox: TempTestDirectorySandbox;

  afterEach(async () => {
    await sandbox.dispose();
  });

  describe('using the simple-project project', () => {
    beforeEach(async () => {
      sandbox = new TempTestDirectorySandbox('simple-project-instrumented');
      await sandbox.init();
      sut = testInjector.injector.injectFunction(createVitestTestRunnerFactory('__stryker2__'));
    });

    it('should run the specs', async () => {
      const runResult = await sut.dryRun(factory.dryRunOptions());
      assertions.expectCompleted(runResult);
    });
  });
});
