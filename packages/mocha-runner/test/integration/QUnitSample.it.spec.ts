import * as path from 'path';

import { commonTokens } from '@stryker-mutator/api/plugin';
import { RunStatus } from '@stryker-mutator/api/test_runner';
import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { MochaTestRunner } from '../../src/MochaTestRunner';
import { createMochaOptions } from '../helpers/factories';

describe('QUnit sample', () => {
  let files: string[];

  beforeEach(() => {
    files = [];
  });

  function createSut() {
    return testInjector.injector.provideValue(commonTokens.sandboxFileNames, files).injectClass(MochaTestRunner);
  }

  it('should work when configured with "qunit" ui', async () => {
    const mochaOptions = createMochaOptions({
      require: [],
      spec: [resolve('./testResources/qunit-sample/MyMathSpec.js')],
      ui: 'qunit',
    });
    testInjector.options.mochaOptions = mochaOptions;
    files = mochaOptions.spec!;
    const sut = createSut();
    await sut.init();
    const actualResult = await sut.run({});
    expect(actualResult.status).eq(RunStatus.Complete);
    expect(actualResult.tests.map((t) => t.name)).deep.eq([
      'Math should be able to add two numbers',
      'Math should be able 1 to a number',
      'Math should be able negate a number',
      'Math should be able to recognize a negative number',
      'Math should be able to recognize that 0 is not a negative number',
    ]);
  });

  it('should not run tests when not configured with "qunit" ui', async () => {
    files = [resolve('./testResources/qunit-sample/MyMathSpec.js'), resolve('./testResources/qunit-sample/MyMath.js')];
    testInjector.options.mochaOptions = createMochaOptions({
      files: [resolve('./testResources/qunit-sample/MyMathSpec.js')],
    });
    const sut = createSut();
    await sut.init();
    const actualResult = await sut.run({});
    expect(actualResult.status).eq(RunStatus.Complete);
    expect(actualResult.tests).lengthOf(0);
  });
});

function resolve(fileName: string) {
  return path.resolve(__dirname, '..', '..', fileName);
}
