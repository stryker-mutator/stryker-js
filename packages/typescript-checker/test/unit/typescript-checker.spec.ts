import { testInjector, factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { createTypescriptChecker } from '../../src/index.js';

import { TypescriptChecker } from '../../src/typescript-checker';
import { TypeScriptCheckerOptionsWithStrykerOptions } from '../../src/typescript-checker-options-with-stryker-options';

describe('typescript-checker', () => {
  let sut: TypescriptChecker;
  beforeEach(() => {
    (testInjector.options as TypeScriptCheckerOptionsWithStrykerOptions).typeScriptChecker = { strategy: 'noGrouping' };
    sut = testInjector.injector.injectFunction(createTypescriptChecker);
    return sut.init();
  });

  it('noGrouping setting should not group mutants', async () => {
    const result = await sut.group([factory.mutant(), factory.mutant(), factory.mutant()]);
    expect(result.length).to.be.eq(3);
  });
});
