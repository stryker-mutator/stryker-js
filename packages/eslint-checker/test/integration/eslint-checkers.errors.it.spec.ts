import path from 'path';
import { fileURLToPath } from 'url';

import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { createLintChecker } from '../../src/index.js';
import { mochaHooks } from '../setup.js';

const resolveTestResource = path.resolve.bind(
  path,
  path.dirname(fileURLToPath(import.meta.url)),
  '..' /* integration */,
  '..' /* test */,
  '..' /* dist */,
  'testResources',
  'errors'
) as unknown as typeof path.resolve;

describe('Lint checker errors', () => {
  beforeEach(mochaHooks.beforeEach);
  afterEach(mochaHooks.afterEach);

  it('should reject initialization if initial compilation failed', async () => {
    const testProjectRoot = resolveTestResource('compile-error');
    testInjector.options.lintConfigFile = resolveTestResource('compile-error', '.eslintrc.cjs');
    testInjector.options.mutate = ['*.js'];
    process.chdir(testProjectRoot);
    const sut = testInjector.injector.injectFunction(createLintChecker);
    await expect(sut.init()).rejectedWith('no-empty-function');
  });
});
