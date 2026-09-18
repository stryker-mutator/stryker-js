import { expect } from 'chai';
import sinon from 'sinon';
import { notEmpty } from '@stryker-mutator/util';

import { types, type NodePath } from '@babel/core';

import { MutantCollector } from '../../../src/transformers/mutant-collector.js';
import { transformVue } from '../../../src/transformers/vue-transformer.js';
import { TransformerContext } from '../../../src/transformers/index.js';
import { parse as parseVue } from '../../../src/parsers/vue-parser.js';
import { createParser } from '../../../src/parsers/index.js';
import {
  AstFormat,
  Range,
  ScriptAst,
  TemplateScript,
  VueAst,
} from '../../../src/syntax/index.js';
import { instrumentationBabelHeader } from '../../../src/util/index.js';
import { createParserOptions } from '../../helpers/factories.js';
import { transformerContextStub } from '../../helpers/stubs.js';
import { findNodePath } from '../../helpers/syntax-test-helpers.js';

const originFileName = 'foo.vue';

interface PlannedMutant {
  ast: ScriptAst;
  node: types.Node;
  ignoreReason?: string;
}

describe('vue-transformer', () => {
  let mutantCollector: MutantCollector;
  let context: sinon.SinonStubbedInstance<TransformerContext>;
  let plannedMutants: PlannedMutant[];

  beforeEach(() => {
    mutantCollector = new MutantCollector();
    context = transformerContextStub();
    plannedMutants = [];
  });

  it('should transform every script of an SFC without a `<script setup>` block', async () => {
    const vue = await parseSfc(`<script>
export const greeting = 'hello';
</script>
<script>
window.greeting = greeting;
</script>
`);

    transformVue(vue, mutantCollector, context);

    sinon.assert.calledTwice(context.transform);
    sinon.assert.calledWithExactly(
      context.transform,
      vue.root.moduleScript!.ast,
      mutantCollector,
      context,
    );
    sinon.assert.calledWithExactly(
      context.transform,
      vue.root.additionalScripts[0].ast,
      mutantCollector,
      context,
    );
  });

  it('should transform the scripts of an SFC with a `<script setup>` block without a header', async () => {
    const vue = await parseSfc(`<script setup>
const greeting = 'hello';
</script>
`);

    transformVue(vue, mutantCollector, context);

    sinon.assert.calledOnceWithExactly(
      context.transform,
      vue.root.setup!.script.ast,
      mutantCollector,
      {
        ...context,
        isExpressionContext: false,
        options: { ...context.options, noHeader: true },
      },
    );
  });

  describe('header placement', () => {
    it('should place the header in a created module script when a mutant is inside a compiler macro argument', async () => {
      const rawContent = `<template><p>{{ label }}</p></template>
<script setup lang="ts">
const props = defineProps({ label: 'hello' });
</script>
`;
      const vue = await parseSfc(rawContent);
      const setupScript = vue.root.setup!.script;
      planMutant(setupScript, (path) => path.isObjectExpression());

      transformVue(vue, mutantCollector, context);

      const moduleScript = vue.root.moduleScript!;
      expect(moduleScript.ast.format).eq(AstFormat.TS);
      expect(moduleScript.ast.rawContent).eq('');
      expect(moduleScript.isExpression).false;
      expect(vue.rawContent).eq(
        `<script lang="ts">\n\n</script>\n${rawContent}`,
      );
      expect(scriptsWithHeader(vue)).deep.eq([moduleScript]);
    });

    it('should create a module script without a lang when the `<script setup>` has none', async () => {
      const rawContent = `<script setup>
const props = defineProps({ label: 'hello' });
</script>
`;
      const vue = await parseSfc(rawContent);
      planMutant(vue.root.setup!.script, (path) => path.isObjectExpression());

      transformVue(vue, mutantCollector, context);

      expect(vue.root.moduleScript!.ast.format).eq(AstFormat.JS);
      expect(vue.rawContent).eq(`<script>\n\n</script>\n${rawContent}`);
    });

    it('should shift the range of the scripts that were already there', async () => {
      const vue = await parseSfc(`<script setup lang="ts">
const props = defineProps({ label: 'hello' });
</script>
`);
      const setupScript = vue.root.setup!.script;
      const rangeBefore = { ...setupScript.range };
      const offsetBefore = { ...setupScript.ast.offset! };
      planMutant(setupScript, (path) => path.isObjectExpression());

      transformVue(vue, mutantCollector, context);

      const moduleScriptStartLength = '<script lang="ts">\n'.length;
      const insertedLength = '<script lang="ts">\n\n</script>\n'.length;
      const expectedRange: Range = {
        start: rangeBefore.start + insertedLength,
        end: rangeBefore.end + insertedLength,
      };
      expect(setupScript.range).deep.eq(expectedRange);
      expect(vue.root.moduleScript!.range).deep.eq({
        start: moduleScriptStartLength,
        end: moduleScriptStartLength,
      });
      /* The offset maps the mutants back to the original file, the insertion doesn't change that */
      expect(setupScript.ast.offset).deep.eq(offsetBefore);
    });

    it('should place the header in an existing module script rather than creating one', async () => {
      const rawContent = `<script>
export const fallback = 'hello';
</script>
<script setup>
const props = defineProps({ label: fallback });
</script>
`;
      const vue = await parseSfc(rawContent);
      const moduleScript = vue.root.moduleScript!;
      const rangeBefore = { ...moduleScript.range };
      planMutant(vue.root.setup!.script, (path) => path.isObjectExpression());

      transformVue(vue, mutantCollector, context);

      expect(vue.root.moduleScript).eq(moduleScript);
      expect(vue.rawContent).eq(rawContent);
      expect(moduleScript.range).deep.eq(rangeBefore);
      expect(scriptsWithHeader(vue)).deep.eq([moduleScript]);
    });

    it('should keep the header inside the `<script setup>` block when no mutant is inside a compiler macro argument', async () => {
      const rawContent = `<template><p>{{ greeting }}</p></template>
<script setup>
const greeting = 'hello';
</script>
`;
      const vue = await parseSfc(rawContent);
      const setupScript = vue.root.setup!.script;
      const rangeBefore = { ...setupScript.range };
      planMutant(setupScript, (path) => path.isStringLiteral());

      transformVue(vue, mutantCollector, context);

      expect(vue.root.moduleScript).undefined;
      expect(vue.rawContent).eq(rawContent);
      expect(setupScript.range).deep.eq(rangeBefore);
      expect(scriptsWithHeader(vue)).deep.eq([setupScript]);
    });

    it('should only place the header in the scripts that had mutants when they were transformed', async () => {
      const vue = await parseSfc(`<script>
export const greeting = 'hello';
</script>
<script setup>
const label = greeting;
</script>
`);
      const setupScript = vue.root.setup!.script;
      /* The module script is transformed first, by then no mutant was collected yet */
      planMutant(
        setupScript,
        (path) => path.isIdentifier() && path.node.name === 'greeting',
      );

      transformVue(vue, mutantCollector, context);

      expect(vue.root.moduleScript).ok;
      expect(scriptsWithHeader(vue)).deep.eq([setupScript]);
    });

    it('should not place a header at all when no mutants were collected', async () => {
      const rawContent = `<script setup>
const props = defineProps({ label: 'hello' });
</script>
`;
      const vue = await parseSfc(rawContent);

      transformVue(vue, mutantCollector, context);

      expect(vue.root.moduleScript).undefined;
      expect(vue.rawContent).eq(rawContent);
      expect(scriptsWithHeader(vue)).deep.eq([]);
    });

    it('should not create a module script when the mutant inside the compiler macro argument is ignored', async () => {
      const vue = await parseSfc(`<script setup>
const props = defineProps({ label: 'hello' });
</script>
`);
      const setupScript = vue.root.setup!.script;
      planMutant(
        setupScript,
        (path) => path.isObjectExpression(),
        'ignored for a reason',
      );
      planMutant(
        setupScript,
        (path) => path.isIdentifier() && path.node.name === 'props',
      );

      transformVue(vue, mutantCollector, context);

      expect(vue.root.moduleScript).undefined;
      expect(scriptsWithHeader(vue)).deep.eq([setupScript]);
    });
  });

  async function parseSfc(rawContent: string): Promise<VueAst> {
    const vue = await parseVue(rawContent, originFileName, {
      parse: createParser(createParserOptions()),
    });
    context.transform.callsFake((ast) => {
      for (const planned of plannedMutants) {
        if (planned.ast === ast) {
          mutantCollector.collect(originFileName, planned.node, {
            mutatorName: 'test',
            replacement: types.objectExpression([]),
            ignoreReason: planned.ignoreReason,
          });
        }
      }
    });
    return vue;
  }

  /**
   * Collect a mutant on the first node matching the query while the script is being transformed.
   */
  function planMutant(
    script: TemplateScript,
    searchQuery: (path: NodePath) => boolean,
    ignoreReason?: string,
  ): void {
    plannedMutants.push({
      ast: script.ast,
      node: findNodePath(script.ast.root, searchQuery).node,
      ignoreReason,
    });
  }
});

/**
 * The scripts of which the program starts with the instrumentation header.
 */
function scriptsWithHeader(vue: VueAst): TemplateScript[] {
  const [headerStart] = instrumentationBabelHeader;
  const headerStartName =
    headerStart.type === 'FunctionDeclaration' ? headerStart.id!.name : '';
  return [vue.root.moduleScript, ...vue.root.additionalScripts]
    .filter(notEmpty)
    .filter(({ ast }) => {
      const [firstStatement] = ast.root.program.body;
      return (
        firstStatement?.type === 'FunctionDeclaration' &&
        firstStatement.id?.name === headerStartName
      );
    });
}
