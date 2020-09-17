import path = require('path');

import { testInjector } from '@stryker-mutator/test-helpers';

import { expect } from 'chai';
import { DryRunStatus, TestStatus } from '@stryker-mutator/api/test_runner';

import { createMochaTestRunner } from '../../src';

/**
 * This file will run the mocha runner a number of times in a test suite that is designed
 * to result in an OutOfMemory error when the mocha test runner does not clean it's memory
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
  process.chdir(path.resolve(__dirname, '..', '..', 'testResources', 'big-project'));
  testInjector.options.mochaOptions = { 'no-config': true };
  const mochaRunner = testInjector.injector.injectFunction(createMochaTestRunner);

  await mochaRunner.init();
  await doDryRun();

  async function doDryRun(n = 20) {
    if (n > 0) {
      console.log(`Iterator count ${n}`);
      const result = await mochaRunner.dryRun({ coverageAnalysis: 'off', timeout: 3000 });
      if (result.status === DryRunStatus.Complete) {
        expect(result.tests).lengthOf(1);
        expect(result.tests[0].status).eq(TestStatus.Success);
      }
      await doDryRun(n - 1);
    }
  }
}
