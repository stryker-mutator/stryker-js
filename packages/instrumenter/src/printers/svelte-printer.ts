import { SvelteAst } from '../syntax/index.js';

import { Printer } from './index.js';

export const print: Printer<SvelteAst> = ({ root, rawContent }, context) => {
  let currentIndex = 0;
  let svelte = '';

  const sortedScripts = [root.mainScript, ...root.additionalScripts].sort((a, b) => a.range.start - b.range.start);
  for (const script of sortedScripts) {
    if (script.expression) {
      const code = context.print(script.ast, context);
      const codeWithoutSemicolon = code.slice(0, -1);
      svelte += rawContent.substring(currentIndex, script.range.start) + codeWithoutSemicolon;
      currentIndex = script.range.end;
    } else {
      svelte += rawContent.substring(currentIndex, script.range.start);
      svelte += '\n';
      svelte += context.print(script.ast, context);
      svelte += '\n';
      currentIndex = script.range.end;
    }
  }

  svelte += rawContent.substring(currentIndex);

  return svelte;
};
