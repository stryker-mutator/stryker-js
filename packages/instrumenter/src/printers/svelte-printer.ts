import { notEmpty } from '@stryker-mutator/util';

import { SvelteAst } from '../syntax';

import { Printer } from './index.js';

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
  svelte += rawContent.substring(currentIndex);

  return svelte;
};
