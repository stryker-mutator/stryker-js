import * as path from 'path';

import { commonTokens } from '@stryker-mutator/api/plugin';
import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import { RunStatus } from '@stryker-mutator/api/test_runner';

import { MochaTestRunner } from '../../src/MochaTestRunner';
import MochaOptionsEditor from '../../src/MochaOptionsEditor';
import MochaOptionsLoader from '../../src/MochaOptionsLoader';

describe('Running a project with root hooks', () => {
  const cwd = process.cwd();

  let sut: MochaTestRunner;

  beforeEach(async () => {
    process.chdir(path.resolve(__dirname, '..', '..', 'testResources', 'parallel-with-root-hooks-sample'));
    testInjector.injector.provideClass('loader', MochaOptionsLoader).injectClass(MochaOptionsEditor).edit(testInjector.options);
    sut = testInjector.injector.provideValue(commonTokens.sandboxFileNames, []).injectClass(MochaTestRunner);
    await sut.init();
  });

  afterEach(() => {
    process.chdir(cwd);
  });

  it('should have run the root hooks', async () => {
    const result = await sut.run({});
    expect(result.status).eq(RunStatus.Complete);
    expect(result.tests).has.lengthOf(2);
    expect(result.errorMessages).lengthOf(0);
  });
});
