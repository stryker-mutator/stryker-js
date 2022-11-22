import { SvelteAst } from '../syntax';

import { Printer } from './index.js';

export const print: Printer<SvelteAst> = ({ root, rawContent }, context) => {
  const sortedScripts = [...root.scripts].sort((a, b) => a.root.start! - b.root.start!);
  let currentIndex = 0;
  let svelte = '';
  for (const script of sortedScripts) {
    svelte += rawContent.substring(currentIndex, script.root.start!);
    svelte += '\n';
    svelte += context.print(script, context);
    svelte += '\n';
    currentIndex = script.root.end!;
  }
  svelte += rawContent.substring(currentIndex);
  return svelte;
};
