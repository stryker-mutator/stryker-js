import { TEST_INJECTOR } from '../../../test-helpers/src';
import { COMMON_TOKENS } from '@stryker-mutator/api/plugin';
import MochaTestRunner from '../../src/MochaTestRunner';
import MochaOptionsLoader from '../../src/MochaOptionsLoader';
import { MOCHA_OPTIONS_KEY } from '../../src/utils';
import * as path from 'path';
import { expect } from 'chai';

describe('Mocha 6 file resolving integration', () => {

  const cwd = process.cwd();

  afterEach(() => {
    process.chdir(cwd);
  });

  it('should resolve test files while respecting "files", "spec", "extension" and "exclude" properties', () => {
    const configLoader = createConfigLoader();
    process.chdir(resolveTestDir());
    TEST_INJECTOR.options[MOCHA_OPTIONS_KEY] = configLoader.load(TEST_INJECTOR.options);
    const testRunner = createTestRunner();
    testRunner.init();
    expect((testRunner as any).testFileNames).deep.eq([
      resolveTestDir('helpers/1.ts'),
      resolveTestDir('helpers/2.js'),
      resolveTestDir('specs/3.js'),
      resolveTestDir('specs/4.ts')
    ]);
  });

  function createConfigLoader() {
    return TEST_INJECTOR.injector
      .injectClass(MochaOptionsLoader);
  }

  function createTestRunner() {
    return TEST_INJECTOR.injector
      .provideValue(COMMON_TOKENS.sandboxFileNames, [])
      .injectClass(MochaTestRunner);
  }

  function resolveTestDir(fileName = '.') {
    return path.resolve(__dirname, '..', '..', 'testResources', 'file-resolving', fileName);
  }
});
