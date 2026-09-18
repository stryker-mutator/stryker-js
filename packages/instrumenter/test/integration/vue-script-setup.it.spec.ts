import { promises as fsPromises } from 'fs';

import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import { compileScript, parse } from 'vue/compiler-sfc';

import { createInstrumenter, Instrumenter } from '../../src/index.js';
import { createInstrumenterOptions } from '../helpers/factories.js';
import { resolveTestResource } from '../helpers/resolve-test-resource.js';

describe('vue script setup integration', () => {
  let sut: Instrumenter;

  beforeEach(() => {
    sut = testInjector.injector.injectFunction(createInstrumenter);
  });

  describe('an instrumented SFC with compiler macros', () => {
    let instrumented: string;

    beforeEach(async () => {
      instrumented = await instrument('vue-script-setup-macros.vue');
    });

    it('should be compiled by the vue compiler without errors', () => {
      const { descriptor, errors } = parseSfc();

      expect(errors).lengthOf(0);
      /* The instrumentation header is placed in a module level script */
      expect(descriptor.script).ok;
      expect(descriptor.scriptSetup).ok;
    });

    for (const inlineTemplate of [true, false]) {
      describe(`with inlineTemplate: ${inlineTemplate}`, () => {
        it('should keep the model contract of `defineModel`', () => {
          const { content } = compileScript(parseSfc().descriptor, {
            id: 'vue-script-setup-macros',
            inlineTemplate,
          });

          expect(declaredPropNames(content)).deep.eq(['open', 'openModifiers']);
          expect(content).include('emits: ["update:open"]');
          /* The default of the model is mutation switched, but still defaults to false */
          expect(content).match(
            /default: stryMutAct_9fa48\("\d+"\) \? true : \(stryCov_9fa48\("\d+"\), false\)/,
          );
        });
      });
    }

    function parseSfc() {
      return parse(instrumented, { filename: 'vue-script-setup-macros.vue' });
    }
  });

  async function instrument(fileName: string): Promise<string> {
    const name = resolveTestResource('instrumenter', fileName);
    const result = await sut.instrument(
      [
        {
          name,
          mutate: true,
          content: await fsPromises.readFile(name, 'utf-8'),
        },
      ],
      createInstrumenterOptions(),
    );
    return result.files[0].content;
  }
});

/**
 * The names of the props the compiler declared, in the order it declared them.
 */
function declaredPropNames(compiledScript: string): string[] {
  return [...compiledScript.matchAll(/^\s*"([\w$]+)":/gm)].map(
    ([, name]) => name,
  );
}
