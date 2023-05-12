import { factory, assertions, testInjector, TempTestDirectorySandbox } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { createVitestTestRunnerFactory, VitestTestRunner } from '../../src/vitest-test-runner.js';

describe('VitestRunner integration', () => {
  let sut: VitestTestRunner;
  let sandbox: TempTestDirectorySandbox;

  afterEach(async () => {
    await sut.dispose();
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
      const runResult = await sut.dryRun();
      assertions.expectCompleted(runResult);
    });

    it('should report mutant coverage', async () => {
      await sut.init();
      const runResult = await sut.dryRun();
      assertions.expectCompleted(runResult);
      expect(runResult.mutantCoverage).to.not.be.undefined;
    });
  });

  describe('using multiple-configs project', () => {
    beforeEach(async () => {
      sandbox = new TempTestDirectorySandbox('multiple-configs');
      await sandbox.init();
    });

    it('should load default vitest config when config file is not set', async () => {
      testInjector.options.vitest = { config: undefined };
      sut = testInjector.injector.injectFunction(createVitestTestRunnerFactory('__stryker2__'));

      await sut.init();
      const runResult = await sut.dryRun();

      assertions.expectCompleted(runResult);
      expect(runResult.tests).to.have.lengthOf(1);
      expect(runResult.tests[0].name).eq('should be able to add two numbers');
    });

    it('should load custom vitest config when config file is set', async () => {
      testInjector.options.vitest = { config: 'vitest.only.addOne.conifg.ts' };
      sut = testInjector.injector.injectFunction(createVitestTestRunnerFactory('__stryker2__'));

      await sut.init();
      const runResult = await sut.dryRun();

      assertions.expectCompleted(runResult);
      expect(runResult.tests).to.have.lengthOf(1);
      expect(runResult.tests[0].name).eq('should be able to add one to a number');
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
      });
      mutantRunOptions.activeMutant.id = '1';

      const runResult = await sut.mutantRun(mutantRunOptions);

      assertions.expectKilled(runResult);
      expect(runResult.killedBy).deep.eq(['tests/math.spec.ts#math should be able to add two numbers']);
      expect(runResult.failureMessage.replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '')).contains('expected -3 to be 7');
    });

    it('should kill mutant 1 with mutantActivation runtime', async () => {
      await sut.init();
      const mutantRunOptions = factory.mutantRunOptions({
        mutantActivation: 'runtime',
        activeMutant: factory.mutant({ id: '1' }),
        sandboxFileName: `${sandbox.tmpDir}/math.ts`,
      });
      mutantRunOptions.activeMutant.id = '1';

      const runResult = await sut.mutantRun(mutantRunOptions);

      assertions.expectKilled(runResult);
      expect(runResult.killedBy).deep.eq(['tests/math.spec.ts#math should be able to add two numbers']);
      expect(runResult.failureMessage.replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '')).contains('expected -3 to be 7');
    });

    it('mutant run with single filter should only run 1 test', async () => {
      await sut.init();
      const mutantRunOptions = factory.mutantRunOptions({
        mutantActivation: 'runtime',
        activeMutant: factory.mutant({ id: '1' }),
        sandboxFileName: `${sandbox.tmpDir}/math.ts`,
        testFilter: ['math.spec.ts#math should be able to add two numbers'],
      });
      mutantRunOptions.activeMutant.id = '1';

      const runResult = await sut.mutantRun(mutantRunOptions);

      assertions.expectKilled(runResult);
      expect(runResult.nrOfTests).eq(1);
      expect(runResult.killedBy).deep.eq(['tests/math.spec.ts#math should be able to add two numbers']);
      expect(runResult.failureMessage.replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '')).contains('expected -3 to be 7');
    });

    it('mutant run with 2 filters should run 2 tests', async () => {
      await sut.init();
      const mutantRunOptions = factory.mutantRunOptions({
        mutantActivation: 'runtime',
        activeMutant: factory.mutant({ id: '1' }),
        sandboxFileName: `${sandbox.tmpDir}/math.ts`,
        testFilter: ['math.spec.ts#math should be able to add two numbers', 'math.spec.ts#math should be able to add one to a number'],
      });
      mutantRunOptions.activeMutant.id = '1';

      const runResult = await sut.mutantRun(mutantRunOptions);

      assertions.expectKilled(runResult);
      expect(runResult.nrOfTests).eq(2);
      expect(runResult.killedBy).deep.eq(['tests/math.spec.ts#math should be able to add two numbers']);
      expect(runResult.failureMessage.replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '')).contains('expected -3 to be 7');
    });

    it('mutant run with new filter on second run should run 1 test', async () => {
      await sut.init();
      const mutantRunOptions = factory.mutantRunOptions({
        mutantActivation: 'runtime',
        activeMutant: factory.mutant({ id: '1' }),
        sandboxFileName: `${sandbox.tmpDir}/math.ts`,
        testFilter: ['math.spec.ts#math should be able to add two numbers'],
      });
      mutantRunOptions.activeMutant.id = '1';

      await sut.mutantRun(mutantRunOptions);
      mutantRunOptions.testFilter = ['math.spec.ts#math should be able to add one to a number'];
      const runResult = await sut.mutantRun(mutantRunOptions);

      assertions.expectSurvived(runResult);
      expect(runResult.nrOfTests).eq(1);
    });
  });
});
