import { notEmpty } from '@stryker-mutator/util';

import { types } from '@babel/core';

import { AstFormat } from '../syntax/index.js';
import { placeHeader } from '../util/syntax-helpers.js';

import { AstTransformer } from './transformer.js';

const moduleScriptStart = '<script context="module">\n';
const moduleScript = `${moduleScriptStart}\n</script>\n`;

export const transformSvelte: AstTransformer<AstFormat.Svelte> = (
  svelte,
  mutantCollector,
  context,
) => {
  const { root, originFileName } = svelte;
  [root.moduleScript, ...root.additionalScripts]
    .filter(notEmpty)
    .forEach((script) => {
      context.transform(script.ast, mutantCollector, {
        ...context,
        options: {
          ...context.options,
          noHeader: true,
        },
      });
    });

  if (mutantCollector.hasPlacedMutants(originFileName)) {
    // We need to place the instrumentation header inside the `<script context="module">` script
    // If there already is a module script, place it there. If not, we need to add it.

    if (!root.moduleScript) {
      root.moduleScript = {
        ast: {
          format: AstFormat.JS,
          root: types.file(types.program([])),
          rawContent: '',
          originFileName,
        },
        range: {
          start: moduleScriptStart.length,
          end: moduleScriptStart.length,
        },
        isExpression: false,
      };
      svelte.rawContent = `${moduleScript}${svelte.rawContent}`;
      svelte.root.additionalScripts.forEach((script) => {
        script.range.start += moduleScript.length;
        script.range.end += moduleScript.length;
      });
    }
    placeHeader(root.moduleScript.ast.root);
  }
};
