import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import { DryRunStatus, TestStatus } from '@stryker-mutator/api/test-runner';

import { createJasmineTestRunnerFactory } from '../../src';
import { resolveTestResource } from '../helpers/resolve-test-resource';

/**
 * This file will run the jasmine runner a number of times in a test suite that is designed
 * to result in an OutOfMemory error when the test runner does not clean its memory
 * Start this process with `--max-old-space-size=32 --max-semi-space-size=1` to get a fast OutOfMemory error (if there is a memory leak)
 *
 * @see https://github.com/stryker-mutator/stryker/issues/2461
 * @see https://nodejs.org/api/modules.html#modules_accessing_the_main_module
 * @see https://stackoverflow.com/questions/30252905/nodejs-decrease-v8-garbage-collector-memory-usage
 */

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}

async function main() {
  process.chdir(resolveTestResource('big-project'));
  const jasmineRunner = testInjector.injector.injectFunction(createJasmineTestRunnerFactory('__stryker2__'));
  await doDryRun();

  async function doDryRun(n = 40) {
    if (n > 0) {
      console.log(`Iterator count ${n}`);
      const result = await jasmineRunner.dryRun({ coverageAnalysis: 'off', timeout: 3000 });
      if (result.status === DryRunStatus.Complete) {
        expect(result.tests).lengthOf(1);
        expect(result.tests[0].status).eq(TestStatus.Success);
      }
      await doDryRun(n - 1);
    }
  }
}
