import { promises as fsPromises } from 'fs';

import { testInjector } from '@stryker-mutator/test-helpers';
import { File } from '@stryker-mutator/api/core';
import { expect } from 'chai';
import chaiJestSnapshot from 'chai-jest-snapshot';

import { Instrumenter } from '../../src';
import { createInstrumenterOptions } from '../helpers/factories';
import { resolveTestResource } from '../helpers/resolve-test-resource';

describe.only('instrumenter integration', () => {
  let sut: Instrumenter;
  beforeEach(() => {
    sut = testInjector.injector.injectClass(Instrumenter);
  });

  it('should be able to instrument html', async () => {
    await arrangeAndActAssert('html-sample.html');
  });
  it('should be able to instrument a simple js file', async () => {
    await arrangeAndActAssert('js-sample.js');
  });
  it('should be able to instrument a simple ts file', async () => {
    await arrangeAndActAssert('ts-sample.ts');
  });
  it('should be able to instrument an angular component', async () => {
    await arrangeAndActAssert('app.component.ts');
  });
  it('should be able to instrument a lit-html file', async () => {
    await arrangeAndActAssert('lit-html-sample.ts');
  });
  it('should be able to instrument a vue sample', async () => {
    await arrangeAndActAssert('vue-sample.vue');
  });
  it('should be able to instrument a vue tsx sample', async () => {
    await arrangeAndActAssert('vue-tsx-sample.vue');
  });
  it('should be able to instrument super calls', async () => {
    await arrangeAndActAssert('super-call.ts');
  });
  it('should be able to instrument js files with a shebang in them', async () => {
    await arrangeAndActAssert('shebang.js');
  });
  it('should not place ignored mutants', async () => {
    await arrangeAndActAssert('ignore.js', createInstrumenterOptions({ excludedMutations: ['ArithmeticOperator'] }));
  });
  it('should be able to instrument switch case statements (using the switchCaseMutantPlacer)', async () => {
    await arrangeAndActAssert('switch-case.js');
  });
  it('should be able to instrument string literals in different places', async () => {
    await arrangeAndActAssert('string-mutations.ts');
  });

  describe('type declarations', () => {
    it('should not produce mutants for TS type definitions', async () => {
      await arrangeAndActAssert('type-definitions.ts');
    });
    it('should not produce mutants for flow-types', async () => {
      await arrangeAndActAssert('flow-typed.js', createInstrumenterOptions({ plugins: ['flow'] }));
    });
    it('should not produce mutants for a TS declaration file', async () => {
      await arrangeAndActAssert('ts-declarations.ts');
    });
  });

  describe('with mutation ranges', () => {
    it('should only mutate specific mutants for the given file', async () => {
      const fullFileName = resolveTestResource('instrumenter', 'specific-mutants.ts');

      await arrangeAndActAssert('specific-mutants.ts', {
        ...createInstrumenterOptions(),
        mutationRanges: [
          {
            fileName: fullFileName,
            start: { line: 0, column: 10 },
            end: { line: 0, column: 15 },
          },
          {
            fileName: fullFileName,
            start: { line: 3, column: 4 },
            end: { line: 3, column: 11 },
          },
          {
            fileName: fullFileName,
            start: { line: 7, column: 15 },
            end: { line: 7, column: 22 },
          },
          {
            fileName: fullFileName,
            start: { line: 18, column: 2 },
            end: { line: 19, column: 75 },
          },
        ],
      });
    });

    it('should not make any mutations in a file not found in the specific mutants', async () => {
      const fullFileName = resolveTestResource('instrumenter', 'specific-mutants.ts');

      await arrangeAndActAssert('specific-no-mutants.ts', {
        ...createInstrumenterOptions(),
        mutationRanges: [
          {
            fileName: fullFileName,
            start: { line: 1, column: 10 },
            end: { line: 1, column: 15 },
          },
        ],
      });
    });
  });

  async function arrangeAndActAssert(fileName: string, options = createInstrumenterOptions()) {
    const fullFileName = resolveTestResource('instrumenter', fileName);
    const file = new File(fullFileName, await fsPromises.readFile(fullFileName));
    const result = await sut.instrument([file], options);
    expect(result.files).lengthOf(1);
    chaiJestSnapshot.setFilename(resolveTestResource('instrumenter', `${fileName}.out.snap`));
    expect(result.files[0].textContent).matchSnapshot();
  }
});
