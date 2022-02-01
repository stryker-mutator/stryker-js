import { testInjector, factory, assertions } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { createMochaOptions } from '../helpers/factories.js';
import { createMochaTestRunnerFactory } from '../../src/index.js';
import { resolveTestResource } from '../helpers/resolve-test-resource.js';

describe('QUnit sample', () => {
  function createSut() {
    return testInjector.injector.injectFunction(createMochaTestRunnerFactory('__stryker2__'));
  }

  it('should work when configured with "qunit" ui', async () => {
    const mochaOptions = createMochaOptions({
      require: [],
      spec: [resolveTestResource('qunit-sample', 'MyMathSpec.js')],
      ui: 'qunit',
    });
    testInjector.options.mochaOptions = mochaOptions;
    const sut = createSut();
    await sut.init();
    const actualResult = await sut.dryRun(factory.dryRunOptions());
    assertions.expectCompleted(actualResult);
    expect(actualResult.tests.map((t) => t.name)).deep.eq([
      'Math should be able to add two numbers',
      'Math should be able 1 to a number',
      'Math should be able negate a number',
      'Math should be able to recognize a negative number',
      'Math should be able to recognize that 0 is not a negative number',
    ]);
    await sut.dispose();
  });
});
