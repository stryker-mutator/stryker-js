import { expect } from 'chai';
import { testInjector } from '@stryker-mutator/test-helpers';
import { TestRunnerCapabilities } from '@stryker-mutator/api/test-runner';

import { VitestTestRunner } from '../../src/vitest-test-runner.js';

describe(VitestTestRunner.name, () => {
  let sut: VitestTestRunner;

  beforeEach(() => {
    sut = testInjector.injector.provideValue('globalNamespace', '__stryker2__' as const).injectClass(VitestTestRunner);
  });

  it('should have reload capabilities', () => {
    const expectedCapabilities: TestRunnerCapabilities = { reloadEnvironment: true };
    expect(sut.capabilities()).deep.eq(expectedCapabilities);
  });
});
