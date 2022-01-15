import { expect } from 'chai';
import { testInjector } from '@stryker-mutator/test-helpers';

import { MochaOptionsLoader } from '../../src/mocha-options-loader';
import { MochaRunnerWithStrykerOptions } from '../../src/mocha-runner-with-stryker-options';
import { resolveTestResource } from '../helpers/resolve-test-resource';
import { MochaAdapter } from '../../src/mocha-adapter';

describe('Mocha 6 file resolving integration', () => {
  it('should resolve test files while respecting "files", "spec", "extension" and "exclude" properties', () => {
    const configLoader = createConfigLoader();
    process.chdir(resolveTestDir());
    const options: MochaRunnerWithStrykerOptions = { ...testInjector.options, mochaOptions: {} };
    const mochaOptions = configLoader.load(options);
    const mochaAdapter = testInjector.injector.injectClass(MochaAdapter);
    const files = mochaAdapter.collectFiles(mochaOptions);
    expect(files).deep.eq([
      resolveTestDir('helpers/1.ts'),
      resolveTestDir('helpers/2.js'),
      resolveTestDir('specs/3.js'),
      resolveTestDir('specs/4.ts'),
    ]);
  });

  function createConfigLoader() {
    return testInjector.injector.injectClass(MochaOptionsLoader);
  }
  function resolveTestDir(fileName = '.') {
    return resolveTestResource('file-resolving', fileName);
  }
});
