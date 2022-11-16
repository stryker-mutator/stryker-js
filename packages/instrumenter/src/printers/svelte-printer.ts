import { SvelteAst } from '../syntax';

import { Printer } from './index.js';

export const print: Printer<SvelteAst> = ({ root, rawContent }, context) => {
  const sortedScripts = [...root.rootScripts].sort((a, b) => a.root.start! - b.root.start!);
  let currentIndex = 0;
  let html = '';
  for (const script of sortedScripts) {
    html += rawContent.substring(currentIndex, script.root.start!);
    html += '\n';
    html += context.print(script, context);
    html += '\n';
    currentIndex = script.root.end!;
  }
  html += rawContent.substring(currentIndex);
  return html;
};
