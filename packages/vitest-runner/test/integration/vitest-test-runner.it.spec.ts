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

    it('should report mutant coverage', async () => {
      await sut.init();
      const runResult = await sut.dryRun(factory.dryRunOptions());
      assertions.expectCompleted(runResult);
      expect(runResult.mutantCoverage).to.not.be.undefined;
    });
  });

  describe('mutantRun', () => {
    beforeEach(async () => {
      sandbox = new TempTestDirectorySandbox('simple-project-instrumented');
      await sandbox.init();
      sut = testInjector.injector.injectFunction(createVitestTestRunnerFactory('__stryker2__'));
    });
    it('should kill mutant 1 with mutantActivation static', async () => {
      await sut.init();
      const mutantRunOptions = factory.mutantRunOptions({
        mutantActivation: 'static',
        activeMutant: factory.mutant({ id: '1' }),
        sandboxFileName: `${sandbox.tmpDir}/math.ts`,
        testFilter: ['math.spec.ts'],
      });
      mutantRunOptions.activeMutant.id = '1';

      const runResult = await sut.mutantRun(mutantRunOptions);

      assertions.expectKilled(runResult);
      expect(runResult.killedBy).deep.eq(['tests/math.spec.ts#should be able to add two numbers']);
      expect(runResult.failureMessage.replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '')).contains('expected -3 to be 7');
    });
    it('should kill mutant 1 with mutantActivation runtime', async () => {
      await sut.init();
      const mutantRunOptions = factory.mutantRunOptions({
        mutantActivation: 'runtime',
        activeMutant: factory.mutant({ id: '1' }),
        sandboxFileName: `${sandbox.tmpDir}/math.ts`,
        testFilter: ['math.spec.ts'],
      });
      mutantRunOptions.activeMutant.id = '1';

      const runResult = await sut.mutantRun(mutantRunOptions);

      assertions.expectKilled(runResult);
      expect(runResult.killedBy).deep.eq(['tests/math.spec.ts#should be able to add two numbers']);
      expect(runResult.failureMessage.replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '')).contains('expected -3 to be 7');
    });
  });
});
