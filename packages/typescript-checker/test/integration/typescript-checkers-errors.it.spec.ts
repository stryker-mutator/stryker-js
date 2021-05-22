import path from 'path';

import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { createTypescriptChecker } from '../../src';

const resolveTestResource = path.resolve.bind(
  path,
  __dirname,
  '..' /* integration */,
  '..' /* test */,
  '..' /* dist */,
  'testResources',
  'errors'
) as unknown as typeof path.resolve;

describe('Typescript checker errors', () => {
  it('should reject initialization if initial compilation failed', async () => {
    testInjector.options.tsconfigFile = resolveTestResource('compile-error', 'tsconfig.json');
    const sut = testInjector.injector.injectFunction(createTypescriptChecker);
    await expect(sut.init()).rejectedWith(
      'TypeScript error(s) found in dry run compilation: testResources/errors/compile-error/add.ts(2,3): error TS2322:'
    );
  });

  it('should reject initialization if tsconfig was invalid', async () => {
    testInjector.options.tsconfigFile = resolveTestResource('invalid-tsconfig', 'tsconfig.json');
    const sut = testInjector.injector.injectFunction(createTypescriptChecker);
    await expect(sut.init()).rejectedWith(
      'TypeScript error(s) found in dry run compilation: testResources/errors/invalid-tsconfig/tsconfig.json(1,1): error TS1005:'
    );
  });

  it("should reject when tsconfig file doesn't exist", async () => {
    testInjector.options.tsconfigFile = resolveTestResource('empty-dir', 'tsconfig.json');
    const sut = testInjector.injector.injectFunction(createTypescriptChecker);
    await expect(sut.init()).rejectedWith(
      `The tsconfig file does not exist at: "${resolveTestResource(
        'empty-dir',
        'tsconfig.json'
      )}". Please configure the tsconfig file in your stryker.conf file using "tsconfigFile"`
    );
  });
});
