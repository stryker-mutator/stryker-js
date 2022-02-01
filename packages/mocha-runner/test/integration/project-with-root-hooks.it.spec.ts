import { assertions, testInjector, factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { createMochaTestRunnerFactory, MochaTestRunner } from '../../src/index.js';
import { resolveTestResource } from '../helpers/resolve-test-resource.js';

describe('Running a project with root hooks', () => {
  let sut: MochaTestRunner;

  beforeEach(async () => {
    process.chdir(resolveTestResource('parallel-with-root-hooks-sample'));
    sut = testInjector.injector.injectFunction(createMochaTestRunnerFactory('__stryker2__'));
    await sut.init();
  });

  afterEach(async () => {
    await sut.dispose();
  });

  it('should have run the root hooks', async () => {
    const result = await sut.dryRun(factory.dryRunOptions({}));
    assertions.expectCompleted(result);
    expect(result.tests).has.lengthOf(2);
  });
});
