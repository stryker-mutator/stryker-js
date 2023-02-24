import { factory, assertions, testInjector, TempTestDirectorySandbox } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

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
      await sut.init();
      const runResult = await sut.dryRun(factory.dryRunOptions());
      assertions.expectCompleted(runResult);
    });
  });

  describe('mutantRun', () => {
    beforeEach(async () => {
      sandbox = new TempTestDirectorySandbox('simple-project-instrumented');
      await sandbox.init();
      sut = testInjector.injector.injectFunction(createVitestTestRunnerFactory('__stryker2__'));
    });
    it('should kill mutant 1', async () => {
      await sut.init();
      const mutantRunOptions = factory.mutantRunOptions({
        activeMutant: factory.mutant({ id: '1' }),
        sandboxFileName: `${sandbox.tmpDir}/math.ts`,
        testFilter: ['**/*.spec.ts'],
      });
      mutantRunOptions.activeMutant.id = '1';

      const runResult = await sut.mutantRun(mutantRunOptions);

      assertions.expectKilled(runResult);
      expect(runResult.killedBy).deep.eq(['Add should be able to add two numbers']);
      expect(runResult.failureMessage.replace(/\x1B[[(?);]{0,2}(;?\d)*./g, ''))
        .contains('Expected: 7')
        .contains('Received: -3');
    });
  });
});
