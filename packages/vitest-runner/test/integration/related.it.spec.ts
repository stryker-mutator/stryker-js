import {
  assertions,
  factory,
  TempTestDirectorySandbox,
  testInjector,
} from '@stryker-mutator/test-helpers';

import {
  createVitestTestRunnerFactory,
  VitestTestRunner,
} from '../../src/vitest-test-runner.js';
import { VitestRunnerOptionsWithStrykerOptions } from '../../src/vitest-runner-options-with-stryker-options.js';
import { createVitestRunnerOptions } from '../util/factories.js';
import path from 'path';
import { expect } from 'chai';

// Tests for [Vitest's related mode](https://vitest.dev/guide/cli.html#vitest-related)
// @see https://github.com/stryker-mutator/stryker-js/issues/5465
describe('Vitest runner related', () => {
  let sut: VitestTestRunner;
  let sandbox: TempTestDirectorySandbox;
  let options: VitestRunnerOptionsWithStrykerOptions;
  let mathFileName: string;
  let stringUtilsFileName: string;
  const mathTest1 = 'src/math.spec.ts#math should support simple addition';
  const mathTest2 = 'src/math.spec.ts#math should support simple subtraction';
  const stringUtilsTest1 =
    'src/string-utils.spec.ts#string-utils should capitalize the first letter';

  beforeEach(async () => {
    sut = testInjector.injector.injectFunction(
      createVitestTestRunnerFactory('__stryker2__'),
    );
    options = testInjector.options as VitestRunnerOptionsWithStrykerOptions;
    options.vitest = createVitestRunnerOptions();
    sandbox = new TempTestDirectorySandbox('multiple-files');
    await sandbox.init();
    mathFileName = path.resolve(sandbox.tmpDir, 'src', 'math.ts');
    stringUtilsFileName = path.resolve(
      sandbox.tmpDir,
      'src',
      'string-utils.ts',
    );
    await sut.init();
  });

  it('should support related = true', async () => {
    options.vitest.related = true;
    const actualResultMath = await sut.dryRun(
      factory.dryRunOptions({ files: [mathFileName] }),
    );
    const actualResultStringUtils = await sut.dryRun(
      factory.dryRunOptions({ files: [stringUtilsFileName] }),
    );
    assertions.expectCompleted(actualResultMath);
    expect(
      assertions.sortTestResults(actualResultMath.tests).map(({ id }) => id),
    ).deep.eq([
      mathTest1,
      mathTest2,
      // other test shouldn't run
    ]);
    assertions.expectCompleted(actualResultStringUtils);
    expect(actualResultStringUtils.tests.map(({ id }) => id)).deep.eq([
      stringUtilsTest1,
    ]);
  });

  it('should support related = true when mutation testing', async () => {
    options.vitest.related = true;
    const actualResultMath = await sut.mutantRun(
      factory.mutantRunOptions({
        activeMutant: factory.mutant({ id: '9' }),
        testFilter: [mathTest1],
        sandboxFileName: mathFileName,
      }),
    );
    assertions.expectKilled(actualResultMath);
  });

  it('should support related = false', async () => {
    options.vitest.related = false;
    const actualResult = await sut.dryRun(
      factory.dryRunOptions({ files: [mathFileName] }),
    );
    assertions.expectCompleted(actualResult);
    expect(
      assertions.sortTestResults(actualResult.tests).map(({ id }) => id),
    ).deep.eq([mathTest1, mathTest2, stringUtilsTest1]);
  });

  afterEach(async () => {
    await sut.dispose();
    await sandbox.dispose();
  });
});
