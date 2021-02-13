import { assertions, factory, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { createMochaTestRunnerFactory } from '../../src';
import { createMochaOptions } from '../helpers/factories';
import { resolveTestResource } from '../helpers/resolve-test-resource';

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
  });

  it('should not run tests when not configured with "qunit" ui', async () => {
    testInjector.options.mochaOptions = createMochaOptions({
      files: [resolveTestResource('qunit-sample', 'MyMathSpec.js')],
    });
    const sut = createSut();
    await sut.init();
    const actualResult = await sut.dryRun(factory.dryRunOptions());
    assertions.expectCompleted(actualResult);
    expect(actualResult.tests).lengthOf(0);
  });
});
