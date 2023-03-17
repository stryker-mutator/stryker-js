import { TestRunnerCapabilities } from '@stryker-mutator/api/test-runner';
import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { createTapTestRunnerFactory, TapTestRunner } from '../../src/tap-test-runner.js';

describe(TapTestRunner.name, () => {
  let sut: TapTestRunner;

  beforeEach(async () => {
    sut = testInjector.injector.injectFunction(createTapTestRunnerFactory('__stryker2__'));
  });

  describe('capabilities', () => {
    it('should communicate reloadEnvironment =false', () => {
      const expectedCapabilities: TestRunnerCapabilities = {
        reloadEnvironment: false,
      };

      expect(sut.capabilities()).deep.eq(expectedCapabilities);
    });
  });
});
