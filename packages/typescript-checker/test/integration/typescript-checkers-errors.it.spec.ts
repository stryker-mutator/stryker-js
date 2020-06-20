import path from 'path';

import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { createTypescriptOptions } from '../helpers/factories';
import { TypescriptChecker } from '../../src';

const resolveTestResource = (path.resolve.bind(
  path,
  __dirname,
  '..' /* integration */,
  '..' /* test */,
  '..' /* dist */,
  'testResources',
  'errors'
) as unknown) as typeof path.resolve;

describe('Typescript checker errors', () => {
  let sut: TypescriptChecker;

  beforeEach(() => {
    testInjector.options.typescriptChecker = createTypescriptOptions();
    sut = testInjector.injector.injectClass(TypescriptChecker);
  });

  it('should reject initialization if initial compilation failed', async () => {
    process.chdir(resolveTestResource('compile-error'));
    await expect(sut.init()).rejectedWith('TypeScript error(s) found in dry run compilation: add.ts(2,3): error TS2322:');
  });

  it('should reject initialization if tsconfig was invalid', async () => {
    process.chdir(resolveTestResource('invalid-tsconfig'));
    await expect(sut.init()).rejectedWith('TypeScript error(s) found in dry run compilation: tsconfig.json(1,1): error TS1005:');
  });

  it("should reject when tsconfig file doesn't exist", async () => {
    process.chdir(resolveTestResource('empty-dir'));
    await expect(sut.init()).rejectedWith(
      `The tsconfig file does not exist at: "${resolveTestResource(
        'empty-dir',
        'tsconfig.json'
      )}". Please configure the tsconfig file in your stryker.conf file using "typescriptChecker.tsconfigFile"`
    );
  });
});
