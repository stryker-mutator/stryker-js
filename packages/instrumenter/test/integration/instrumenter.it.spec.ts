import { promises as fsPromises } from 'fs';

import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import chaiJestSnapshot from 'chai-jest-snapshot';

import { NodePath } from '@babel/core';

import { createInstrumenter, File, Instrumenter } from '../../src/index.js';
import { createInstrumenterOptions } from '../helpers/factories.js';
import { resolveTestResource } from '../helpers/resolve-test-resource.js';

describe('instrumenter integration', () => {
  let sut: Instrumenter;
  beforeEach(() => {
    sut = testInjector.injector.injectFunction(createInstrumenter);
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
  it('should be able to instrument optional chains', async () => {
    await arrangeAndActAssert('optional-chains.ts');
  });
  it('should be able to instrument functional chains', async () => {
    await arrangeAndActAssert('functional-chains.js');
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
  it('should not place excluded mutations', async () => {
    await arrangeAndActAssert('excluded-mutations.js', createInstrumenterOptions({ excludedMutations: ['ArithmeticOperator'] }));
  });
  it('should not place disabled mutants', async () => {
    await arrangeAndActAssert('disabled.js');
  });
  it('should be able to instrument switch case statements (using the switchCaseMutantPlacer)', async () => {
    await arrangeAndActAssert('switch-case.js');
  });
  it('should be able to instrument string literals in different places', async () => {
    await arrangeAndActAssert('string-mutations.ts');
  });
  it('should be able to place exotic mutants', async () => {
    await arrangeAndActAssert('mutant-placing.ts');
  });
  it('should be able to instrument svelte', async () => {
    await arrangeAndActAssert('svelte-hello-world.svelte');
  });
  it('should be able to instrument typescript inside svelte', async () => {
    await arrangeAndActAssert('svelte-ts.svelte');
  });
  it('should be able to instrument svelte with only a module script tag', async () => {
    await arrangeAndActAssert('svelte-module-script-tag.svelte');
  });
  it('should be able to instrument svelte with an instance, module and template script tags', async () => {
    await arrangeAndActAssert('svelte-multiple-script-tags.svelte');
  });
  it('should be able to instrument svelte with only template scripts tags', async () => {
    await arrangeAndActAssert('svelte-only-template-script-tags.svelte');
  });
  it('should be able to instrument svelte with template expressions', async () => {
    await arrangeAndActAssert('svelte-template-expressions.svelte');
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
      await arrangeAndActAssert({
        name: 'specific-mutants.ts',
        mutate: [
          {
            start: { line: 0, column: 10 },
            end: { line: 0, column: 15 },
          },
          {
            start: { line: 3, column: 4 },
            end: { line: 3, column: 11 },
          },
          {
            start: { line: 7, column: 15 },
            end: { line: 7, column: 22 },
          },
          {
            start: { line: 18, column: 2 },
            end: { line: 19, column: 75 },
          },
        ],
      });
    });

    it('should not make any mutations in a file with mutate = []', async () => {
      await arrangeAndActAssert({ name: 'specific-no-mutants.ts', mutate: [] });
    });

    it('should not make any mutations in a file only containing console.log with console.log ignorer', async () => {
      await arrangeAndActAssert(
        'console-sample.js',
        createInstrumenterOptions({
          ignorers: [consoleIgnorer],
        }),
      );
    });
  });

  async function arrangeAndActAssert(file: Omit<File, 'content'> | string, options = createInstrumenterOptions()) {
    if (typeof file === 'string') {
      file = {
        name: file,
        mutate: true,
      };
    }
    file.name = resolveTestResource('instrumenter', file.name);
    const result = await sut.instrument([{ ...file, content: await fsPromises.readFile(file.name, 'utf-8') }], options);
    expect(result.files).lengthOf(1);
    chaiJestSnapshot.setFilename(resolveTestResource('instrumenter', `${file.name}.out.snap`));
    expect(result.files[0].content).matchSnapshot();
  }

  const consoleIgnorer = {
    shouldIgnore(path: NodePath) {
      if (
        path.isExpressionStatement() &&
        path.node.expression.type === 'CallExpression' &&
        path.node.expression.callee.type === 'MemberExpression' &&
        path.node.expression.callee.object.type === 'Identifier' &&
        path.node.expression.callee.object.name === 'console'
      ) {
        return 'console statement';
      }
      return undefined;
    },
  };
});
