import { commonTokens } from '@stryker-mutator/api/plugin';
import { expect } from 'chai';
import * as path from 'path';
import { testInjector } from '../../../test-helpers/src';
import MochaOptionsLoader from '../../src/MochaOptionsLoader';
import MochaTestRunner from '../../src/MochaTestRunner';
import { mochaOptionsKey } from '../../src/utils';

describe('Mocha 6 file resolving integration', () => {

  const cwd = process.cwd();

  afterEach(() => {
    process.chdir(cwd);
  });

  it('should resolve test files while respecting "files", "spec", "extension" and "exclude" properties', () => {
    const configLoader = createConfigLoader();
    process.chdir(resolveTestDir());
    testInjector.options[mochaOptionsKey] = configLoader.load(testInjector.options);
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
    return testInjector.injector
      .injectClass(MochaOptionsLoader);
  }

  function createTestRunner() {
    return testInjector.injector
      .provideValue(commonTokens.sandboxFileNames, [])
      .injectClass(MochaTestRunner);
  }

  function resolveTestDir(fileName = '.') {
    return path.resolve(__dirname, '..', '..', 'testResources', 'file-resolving', fileName);
  }
});
