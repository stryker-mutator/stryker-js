import path from 'path';

import { testInjector, factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { expectCompleted } from '@stryker-mutator/test-helpers/src/assertions';

import { createMochaTestRunner, MochaTestRunner } from '../../src';

describe('Running a project with root hooks', () => {
  const cwd = process.cwd();

  let sut: MochaTestRunner;

  beforeEach(async () => {
    process.chdir(path.resolve(__dirname, '..', '..', 'testResources', 'parallel-with-root-hooks-sample'));
    sut = testInjector.injector.injectFunction(createMochaTestRunner);
    await sut.init();
  });

  afterEach(() => {
    process.chdir(cwd);
  });

  it('should have run the root hooks', async () => {
    const result = await sut.dryRun(factory.dryRunOptions({}));
    expectCompleted(result);
    expect(result.tests).has.lengthOf(2);
  });
});
