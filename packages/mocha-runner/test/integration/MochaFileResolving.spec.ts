import * as path from 'path';

import { commonTokens } from '@stryker-mutator/api/plugin';
import { expect } from 'chai';
import { testInjector } from '@stryker-mutator/test-helpers';

import MochaOptionsLoader from '../../src/MochaOptionsLoader';
import { MochaTestRunner } from '../../src/MochaTestRunner';
import { MochaRunnerWithStrykerOptions } from '../../src/MochaRunnerWithStrykerOptions';

describe('Mocha 6 file resolving integration', () => {
  const cwd = process.cwd();
  let options: MochaRunnerWithStrykerOptions;

  beforeEach(() => {
    options = testInjector.options as MochaRunnerWithStrykerOptions;
    options.mochaOptions = {};
  });

  afterEach(() => {
    process.chdir(cwd);
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
    return testInjector.injector.provideValue(commonTokens.sandboxFileNames, []).injectClass(MochaTestRunner);
  }

  function resolveTestDir(fileName = '.') {
    return path.resolve(__dirname, '..', '..', 'testResources', 'file-resolving', fileName);
  }
});
