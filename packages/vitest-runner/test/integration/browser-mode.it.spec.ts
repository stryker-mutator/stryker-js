import path from 'path';

import { TempTestDirectorySandbox, testInjector } from '@stryker-mutator/test-helpers';

import { createVitestTestRunnerFactory, VitestTestRunner } from '../../src/vitest-test-runner.js';
import { VitestRunnerOptionsWithStrykerOptions } from '../../src/vitest-runner-options-with-stryker-options.js';

describe('VitestRunner integration', () => {
  let sut: VitestTestRunner;
  let sandbox: TempTestDirectorySandbox;
  let options: VitestRunnerOptionsWithStrykerOptions;
  let sandboxFileName: string;

  beforeEach(async () => {
    sut = testInjector.injector.injectFunction(createVitestTestRunnerFactory('__stryker2__'));
    options = testInjector.options as VitestRunnerOptionsWithStrykerOptions;
    options.vitest = {};

    sandbox = new TempTestDirectorySandbox('browser-project');
    await sandbox.init();
    sandboxFileName = path.resolve(sandbox.tmpDir, 'src/heading.component.ts');
    await sut.init();
  });

  it.skip('should be able to perform the dry-run', async () => {
    const result = await sut.dryRun();
    console.log(result);
  });

  afterEach(async () => {
    await sut.dispose();
    await sandbox.dispose();
  });
});
