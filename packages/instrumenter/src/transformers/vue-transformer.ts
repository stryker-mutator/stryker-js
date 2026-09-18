import { notEmpty } from '@stryker-mutator/util';

import { types, type NodePath } from '@babel/core';
import traverse from '@babel/traverse';
import type { Ignorer } from '@stryker-mutator/api/ignore';

import {
  AstFormat,
  Range,
  ScriptAst,
  TemplateScript,
  VueAst,
  VueSetupScript,
} from '../syntax/index.js';
import { placeHeader } from '../util/syntax-helpers.js';

import { AstTransformer } from './index.js';

/**
 * The compiler macros of which the arguments need to stay statically analyzable.
 * See https://vuejs.org/api/sfc-script-setup.html#defineprops-defineemits
 */
const COMPILER_MACROS = Object.freeze([
  'defineProps',
  'defineEmits',
  'defineOptions',
  'defineModel',
  'defineSlots',
  'withDefaults',
]);

const DEFINE_MODEL_NAME_MSG =
  'The model name of `defineModel` cannot be mutated, the vue compiler reads it to name the model prop and its update event.';

/**
 * Ignores the model name of a `defineModel` call. The compiler derives the name of the prop,
 * of its modifiers prop and of the update event from that literal, so mutating it doesn't
 * change the behavior of the component, it changes the contract of its parent.
 * Only handed to the transform of a `<script setup>` block, where the macro is available.
 */
const defineModelNameIgnorer: Ignorer = {
  shouldIgnore(path: NodePath): string | undefined {
    if (!isStaticStringLiteral(path)) {
      return undefined;
    }
    const call = path.parentPath;
    if (
      !call.isCallExpression() ||
      call.node.callee.type !== 'Identifier' ||
      call.node.callee.name !== 'defineModel' ||
      call.node.arguments[0] !== path.node
    ) {
      return undefined;
    }
    return DEFINE_MODEL_NAME_MSG;
  },
};

/**
 * A string literal of which the value is known at compile time, the only shape the vue
 * compiler accepts as a model name.
 */
function isStaticStringLiteral(
  path: NodePath,
): path is NodePath<types.StringLiteral | types.TemplateLiteral> {
  return (
    path.isStringLiteral() ||
    (path.isTemplateLiteral() && path.node.expressions.length === 0)
  );
}

export const transformVue: AstTransformer<AstFormat.Vue> = (
  vue,
  mutantCollector,
  context,
) => {
  const { root, originFileName } = vue;
  const scripts = [root.moduleScript, ...root.additionalScripts].filter(
    notEmpty,
  );
  const { setup } = root;

  if (!setup) {
    /* Without a `<script setup>` block every script instruments itself, header included */
    scripts.forEach((script) => {
      context.transform(script.ast, mutantCollector, context);
    });
    return;
  }

  /*
   * The macro arguments have to be located up front. Placing mutants rewrites the tree while
   * it is being traversed, so afterwards the original nodes can no longer be found.
   */
  const macroArgumentRanges = collectMacroArgumentRanges(setup.script.ast.root);

  /*
   * Each script would place its own header at the end of its own transform, based on the mutants
   * collected up until that point. Sampling right after each transform keeps that order
   * dependency intact, while the header itself is placed after the gate below is known.
   */
  const scriptsThatNeedAHeader: TemplateScript[] = [];
  for (const script of scripts) {
    context.transform(script.ast, mutantCollector, {
      ...context,
      isExpressionContext: script.isExpression,
      options: {
        ...context.options,
        noHeader: true,
        ignorers:
          script === setup.script
            ? [...context.options.ignorers, defineModelNameIgnorer]
            : context.options.ignorers,
      },
    });
    if (mutantCollector.hasPlacedMutants(originFileName)) {
      scriptsThatNeedAHeader.push(script);
    }
  }

  if (hasMutantInsideMacroArguments()) {
    /*
     * The compiler reads the macro arguments statically, which it can only do while they sit at
     * the top level of the `<script setup>` block. Mutation switching wraps them in a function,
     * making the header unreachable from there, so it goes into a module level script instead.
     */
    placeHeader(moduleScriptOf(vue, setup).ast.root);
  } else {
    scriptsThatNeedAHeader.forEach((script) => {
      placeHeader(script.ast.root);
    });
  }

  function hasMutantInsideMacroArguments(): boolean {
    return mutantCollector.mutants.some(
      (mutant) =>
        mutant.fileName === originFileName &&
        !mutant.ignoreReason &&
        macroArgumentRanges.some((range) =>
          rangeIncludes(range, mutant.original),
        ),
    );
  }
};

/**
 * Collects the range of every argument of every compiler macro call.
 */
function collectMacroArgumentRanges(root: types.File): Range[] {
  const ranges: Range[] = [];
  traverse(root, {
    noScope: true,
    CallExpression({ node }) {
      if (
        node.callee.type === 'Identifier' &&
        COMPILER_MACROS.includes(node.callee.name)
      ) {
        for (const argument of node.arguments) {
          if (
            typeof argument.start === 'number' &&
            typeof argument.end === 'number'
          ) {
            ranges.push({ start: argument.start, end: argument.end });
          }
        }
      }
    },
  });
  return ranges;
}

function rangeIncludes(range: Range, node: types.Node): boolean {
  return (
    typeof node.start === 'number' &&
    typeof node.end === 'number' &&
    node.start >= range.start &&
    node.end <= range.end
  );
}

/**
 * Returns the module level script of the SFC, creating one when it doesn't have any.
 * A created script is prepended to the raw content, so the ranges of the scripts that were
 * already there move along with it. Their `ast.offset` stays as it is, it maps the mutants
 * back to the original file, which the insertion doesn't change.
 */
function moduleScriptOf(vue: VueAst, setup: VueSetupScript): TemplateScript {
  if (vue.root.moduleScript) {
    return vue.root.moduleScript;
  }
  /* The `lang` of both script blocks has to match, the vue compiler rejects an SFC where it doesn't */
  const moduleScriptStart = setup.lang
    ? `<script lang="${setup.lang}">\n`
    : '<script>\n';
  const moduleScript = `${moduleScriptStart}\n</script>\n`;
  const ast: ScriptAst = {
    format: setup.script.ast.format,
    root: types.file(types.program([])),
    rawContent: '',
    originFileName: vue.originFileName,
  };
  vue.rawContent = `${moduleScript}${vue.rawContent}`;
  vue.root.additionalScripts.forEach((script) => {
    script.range.start += moduleScript.length;
    script.range.end += moduleScript.length;
  });
  vue.root.moduleScript = {
    ast,
    range: {
      start: moduleScriptStart.length,
      end: moduleScriptStart.length,
    },
    isExpression: false,
  };
  return vue.root.moduleScript;
}
