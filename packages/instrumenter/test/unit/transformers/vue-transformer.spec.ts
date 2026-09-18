import { expect } from 'chai';
import sinon from 'sinon';
import { notEmpty } from '@stryker-mutator/util';

import { types, type NodePath } from '@babel/core';

import { MutantCollector } from '../../../src/transformers/mutant-collector.js';
import { transformVue } from '../../../src/transformers/vue-transformer.js';
import {
  TransformerContext,
  transform,
} from '../../../src/transformers/index.js';
import { parse as parseVue } from '../../../src/parsers/vue-parser.js';
import { createParser } from '../../../src/parsers/index.js';
import { print } from '../../../src/printers/index.js';
import { Mutant } from '../../../src/mutant.js';
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
      { ...context, isExpressionContext: false },
    );
    sinon.assert.calledWithExactly(
      context.transform,
      vue.root.additionalScripts[0].ast,
      mutantCollector,
      { ...context, isExpressionContext: false },
    );
  });

  it('should transform the scripts of an SFC with a `<script setup>` block without a header', async () => {
    const vue = await parseSfc(`<script setup>
const greeting = 'hello';
</script>
`);

    transformVue(vue, mutantCollector, context);

    sinon.assert.calledOnce(context.transform);
    const [ast, collector, usedContext] = context.transform.firstCall.args;
    expect(ast).eq(vue.root.setup!.script.ast);
    expect(collector).eq(mutantCollector);
    expect(usedContext.isExpressionContext).false;
    expect(usedContext.options.noHeader).true;
    expect(usedContext.mutateDescription).eq(context.mutateDescription);
  });

  it('should only hand the model name ignorer to the `<script setup>` block', async () => {
    const vue = await parseSfc(`<script>
export const greeting = 'hello';
</script>
<script setup>
const label = greeting;
</script>
`);

    transformVue(vue, mutantCollector, context);

    const [moduleCall, setupCall] = context.transform.getCalls();
    expect(moduleCall.args[0]).eq(vue.root.moduleScript!.ast);
    expect(moduleCall.args[2].options.ignorers).deep.eq(
      context.options.ignorers,
    );
    expect(setupCall.args[0]).eq(vue.root.setup!.script.ast);
    expect(setupCall.args[2].options.ignorers).lengthOf(
      context.options.ignorers.length + 1,
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

    it('should not let a mutant of another script block trip the compiler macro gate', async () => {
      const rawContent = `<template>
  <dialog :open="open"></dialog>
</template>

<script>
export const messageId = 'hi';
</script>

<script setup>
const open = defineModel('open');
</script>
`;
      const vue = await parseSfc(rawContent);
      const moduleScript = vue.root.moduleScript!;
      const setupScript = vue.root.setup!.script;
      /*
       * Every block has its own coordinate system, the mutant of the module script sits at
       * [26, 30) of that block while the `defineModel` name sits at [26, 32) of the
       * `<script setup>` block, so comparing the two directly reports a false overlap.
       */
      const mutantNode = findNodePath(moduleScript.ast.root, (path) =>
        path.isStringLiteral(),
      ).node;
      const macroArgument = findNodePath(setupScript.ast.root, (path) =>
        path.isStringLiteral(),
      ).node;
      expect(mutantNode.start).least(macroArgument.start!);
      expect(mutantNode.end).most(macroArgument.end!);
      planMutant(moduleScript, (path) => path.isStringLiteral());

      transformVue(vue, mutantCollector, context);

      expect(vue.root.moduleScript).eq(moduleScript);
      expect(vue.rawContent).eq(rawContent);
      expect(scriptsWithHeader(vue)).deep.eq([moduleScript, setupScript]);
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

  describe('the model name of `defineModel`', () => {
    it('should be ignored, while the other mutants of the call are placed', async () => {
      const vue = await parseSfc(`<script setup>
const open = defineModel('open', { default: false });
</script>
`);

      /* The real transform, so both the ignorer and the mutators run */
      transform(vue, mutantCollector, transformerContextStub());

      const nameMutant = onlyMutantOf('StringLiteral');
      const defaultMutant = onlyMutantOf('BooleanLiteral');
      expect(nameMutant.ignoreReason).contains('defineModel');
      expect(defaultMutant.ignoreReason).undefined;
      const output = print(vue);
      expect(output).not.include(`stryMutAct_9fa48("${nameMutant.id}")`);
      expect(output).include(`stryMutAct_9fa48("${defaultMutant.id}")`);
      expect(output).include("defineModel('open',");
    });

    it('should also be ignored when it is a template literal', async () => {
      const vue = await parseSfc(
        '<script setup>\nconst open = defineModel(`open`, { default: false });\n</script>\n',
      );

      transform(vue, mutantCollector, transformerContextStub());

      expect(onlyMutantOf('StringLiteral').ignoreReason).contains(
        'defineModel',
      );
    });

    it('should not be ignored outside of a `defineModel` call', async () => {
      const vue = await parseSfc(`<script setup>
const open = defineSomethingElse('open');
</script>
`);

      transform(vue, mutantCollector, transformerContextStub());

      expect(onlyMutantOf('StringLiteral').ignoreReason).undefined;
    });

    function onlyMutantOf(mutatorName: string): Mutant {
      const mutants = mutantCollector.mutants.filter(
        (mutant) => mutant.mutatorName === mutatorName,
      );
      expect(mutants, `expected one ${mutatorName} mutant`).lengthOf(1);
      return mutants[0];
    }
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
