import path from 'path';
import { fileURLToPath } from 'url';

import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { createTypescriptChecker } from '../../../src/index.js';
import { NativeTypescriptChecker } from '../../../src/ts-v7/native-typescript-checker.js';
import { TypescriptCheckerOptionsWithStrykerOptions } from '../../../src/typescript-checker-options-with-stryker-options.js';

const resolveTestResource = path.resolve.bind(
  path,
  path.dirname(fileURLToPath(import.meta.url)),
  '..' /* ts-v7 */,
  '..' /* integration */,
  '..' /* test */,
  '..' /* dist */,
  'testResources',
) as unknown as typeof path.resolve;

describe('Typescript checker (native preview) errors', () => {
  let sut: NativeTypescriptChecker | undefined;

  afterEach(() => {
    sut?.dispose();
    sut = undefined;
  });

  function createSut(tsconfigFile: string): NativeTypescriptChecker {
    (
      testInjector.options as TypescriptCheckerOptionsWithStrykerOptions
    ).typescriptChecker = {
      prioritizePerformanceOverAccuracy: true,
      experimentalNativePreview: true,
    };
    testInjector.options.tsconfigFile = tsconfigFile;
    sut = testInjector.injector.injectFunction(
      createTypescriptChecker,
    ) as NativeTypescriptChecker;
    return sut;
  }

  it('should reject initialization if initial compilation failed', async () => {
    const sut = createSut(
      resolveTestResource('errors', 'compile-error', 'tsconfig.json'),
    );
    await expect(sut.init()).rejectedWith(
      'Typescript error(s) found in dry run compilation: testResources/errors/compile-error/add.ts(2,3): error TS2322:',
    );
  });

  it('should reject initialization if tsconfig was invalid', async () => {
    const sut = createSut(
      resolveTestResource('errors', 'invalid-tsconfig', 'tsconfig.json'),
    );
    let thrown;
    try {
      await sut.init();
      thrown = false;
    } catch (error) {
      thrown = true;
      console.log((error as Error).stack);
      expect((error as Error).message).to.include(
        'Typescript error(s) found in dry run compilation: testResources/errors/invalid-tsconfig/tsconfig.json(1,1): error TS1005:',
      );
    }
    expect(thrown).ok;

    // await expect(sut.init()).rejectedWith(
    //   'Typescript error(s) found in dry run compilation: testResources/errors/invalid-tsconfig/tsconfig.json(1,1): error TS1005:',
    // );
  });

  it("should reject when tsconfig file doesn't exist", async () => {
    const sut = createSut(
      resolveTestResource('errors', 'empty-dir', 'tsconfig.json'),
    );
    await expect(sut.init()).rejectedWith(
      `The tsconfig file does not exist at: "${resolveTestResource(
        'errors',
        'empty-dir',
        'tsconfig.json',
      )}". Please configure the tsconfig file in your stryker.conf file using "tsconfigFile"`,
    );
  });

  it('should reject when the project uses project references', async () => {
    const sut = createSut(
      resolveTestResource('project-references', 'tsconfig.root.json'),
    );
    await expect(sut.init()).rejectedWith('Project references');
  });
});
