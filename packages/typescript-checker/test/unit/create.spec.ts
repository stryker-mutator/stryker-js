import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { createTypescriptChecker } from '../../src/index.js';
import { TypescriptChecker } from '../../src/typescript-checker.js';
import { NativeTypescriptChecker } from '../../src/ts-v7/native-typescript-checker.js';
import { TypescriptCheckerOptionsWithStrykerOptions } from '../../src/typescript-checker-options-with-stryker-options.js';

describe(createTypescriptChecker.name, () => {
  let options: TypescriptCheckerOptionsWithStrykerOptions;

  beforeEach(() => {
    options =
      testInjector.options as TypescriptCheckerOptionsWithStrykerOptions;
  });

  it('should create a TypescriptChecker by default', () => {
    options.typescriptChecker = {
      prioritizePerformanceOverAccuracy: true,
      experimentalNativePreview: false,
    };
    const checker = testInjector.injector.injectFunction(
      createTypescriptChecker,
    );
    expect(checker).instanceOf(TypescriptChecker);
  });

  it('should create a NativeTypescriptChecker when experimentalNativePreview is enabled', () => {
    options.typescriptChecker = {
      prioritizePerformanceOverAccuracy: true,
      experimentalNativePreview: true,
    };
    const checker = testInjector.injector.injectFunction(
      createTypescriptChecker,
    );
    expect(checker).instanceOf(NativeTypescriptChecker);
  });
});
