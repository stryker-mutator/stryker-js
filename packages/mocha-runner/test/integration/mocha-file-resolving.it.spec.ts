import { expect } from 'chai';
import { testInjector } from '@stryker-mutator/test-helpers';

import MochaOptionsLoader from '../../src/mocha-options-loader';
import { MochaRunnerWithStrykerOptions } from '../../src/mocha-runner-with-stryker-options';
import { createMochaTestRunnerFactory } from '../../src';
import { resolveTestResource } from '../helpers/resolve-test-resource';

describe('Mocha 6 file resolving integration', () => {
  let options: MochaRunnerWithStrykerOptions;

  beforeEach(() => {
    options = testInjector.options as MochaRunnerWithStrykerOptions;
    options.mochaOptions = {};
  });

  it('should resolve test files while respecting "files", "spec", "extension" and "exclude" properties', () => {
    const configLoader = createConfigLoader();
    process.chdir(resolveTestDir());
    options.mochaOptions = configLoader.load(options);
    const testRunner = createTestRunner();
    testRunner.init();
    expect((testRunner as any).testFileNames).deep.eq([
      resolveTestDir('helpers/1.ts'),
      resolveTestDir('helpers/2.js'),
      resolveTestDir('specs/3.js'),
      resolveTestDir('specs/4.ts'),
    ]);
  });

  function createConfigLoader() {
    return testInjector.injector.injectClass(MochaOptionsLoader);
  }

  function createTestRunner() {
    return testInjector.injector.injectFunction(createMochaTestRunnerFactory('__stryker2__'));
  }

  function resolveTestDir(fileName = '.') {
    return resolveTestResource('file-resolving', fileName);
  }
});
