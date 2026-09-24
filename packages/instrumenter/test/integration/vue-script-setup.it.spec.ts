import { promises as fsPromises } from 'fs';

import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import { compileScript, parse, SFCParseResult } from 'vue/compiler-sfc';

import { createInstrumenter, Instrumenter } from '../../src/index.js';
import { createInstrumenterOptions } from '../helpers/factories.js';
import { resolveTestResource } from '../helpers/resolve-test-resource.js';

/**
 * Every SFC with a `<script setup>` block, so that each of them is put through the vue
 * compiler. An SFC of which the `lang` doesn't match between its script blocks, or of which
 * a compiler macro lost its static argument, doesn't make it past `compileScript`.
 */
const scriptSetupFixtures = Object.freeze([
  'vue-script-setup.vue',
  'vue-script-setup-ts.vue',
  'vue-script-setup-macros.vue',
  'vue-script-setup-and-module-script.vue',
  'vue-script-setup-header-per-block.vue',
  'vue-script-setup-bare-define-props.vue',
  'vue-script-setup-bare-define-emits.vue',
  'vue-script-setup-bare-with-defaults.vue',
]);

describe('vue script setup integration', () => {
  let sut: Instrumenter;

  beforeEach(() => {
    sut = testInjector.injector.injectFunction(createInstrumenter);
  });

  for (const fixture of scriptSetupFixtures) {
    describe(`the instrumented ${fixture}`, () => {
      let parsed: SFCParseResult;

      beforeEach(async () => {
        parsed = parse(await instrument(fixture), { filename: fixture });
      });

      it('should be parsed by the vue compiler without errors', () => {
        expect(parsed.errors).lengthOf(0);
        expect(parsed.descriptor.scriptSetup).ok;
      });

      for (const inlineTemplate of [true, false]) {
        it(`should be compiled by the vue compiler with inlineTemplate ${inlineTemplate}`, () => {
          compileScript(parsed.descriptor, { id: fixture, inlineTemplate });

          expect(parsed.errors).lengthOf(0);
        });
      }
    });
  }

  describe('the instrumented vue-script-setup-macros.vue', () => {
    let parsed: SFCParseResult;

    beforeEach(async () => {
      parsed = parse(await instrument('vue-script-setup-macros.vue'), {
        filename: 'vue-script-setup-macros.vue',
      });
    });

    it('should hold the instrumentation header in a module level script', () => {
      expect(parsed.descriptor.script).ok;
    });

    for (const inlineTemplate of [true, false]) {
      it(`should keep the model contract of \`defineModel\` with inlineTemplate ${inlineTemplate}`, () => {
        const { content } = compileScript(parsed.descriptor, {
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
    }
  });

  for (const [fixture, declaration] of [
    ['vue-script-setup-bare-define-props.vue', 'props:'],
    ['vue-script-setup-bare-define-emits.vue', 'emits:'],
    ['vue-script-setup-bare-with-defaults.vue', 'props:'],
  ]) {
    for (const inlineTemplate of [true, false]) {
      it(`should keep the bare macro statement of the instrumented ${fixture} with inlineTemplate ${inlineTemplate}`, async () => {
        const parsed = parse(await instrument(fixture), { filename: fixture });

        const { content } = compileScript(parsed.descriptor, {
          id: fixture,
          inlineTemplate,
        });

        expect(content).include(declaration);
      });
    }
  }

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
