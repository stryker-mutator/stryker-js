import { notEmpty } from '@stryker-mutator/util';

import generator from '@babel/generator';

import { SvelteAst } from '../syntax';

import { Printer } from './index.js';

// @ts-expect-error CJS typings not in line with synthetic esm
const generate: typeof generator = generator.default;

export const print: Printer<SvelteAst> = ({ root, rawContent }, context) => {
  let currentIndex = 0;
  let svelte = '';

  const sortedScripts = [root.mainScript, ...root.additionalScripts].filter(notEmpty).sort((a, b) => a.range.start - b.range.start);
  for (const script of sortedScripts) {
    svelte += rawContent.substring(currentIndex, script.range.start);
    svelte += '\n';
    svelte += context.print(script.ast, context);
    svelte += '\n';
    currentIndex = script.range.end;
  }

  root.bindingExpressions?.filter(notEmpty).forEach((expression) => {
    const { code } = generate(expression.ast!);
    const codeWithoutSemicolon = code.slice(0, -1);

    svelte += rawContent.substring(currentIndex, expression.range.start) + codeWithoutSemicolon;
    currentIndex = expression.range.end;
  });

  svelte += rawContent.substring(currentIndex);

  return svelte;
};
