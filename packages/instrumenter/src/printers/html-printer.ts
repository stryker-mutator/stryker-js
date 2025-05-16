import { HtmlAst } from '../syntax/index.js';

import { Printer } from './index.js';

export const print: Printer<HtmlAst> = (ast, context) => {
  const sortedScripts = [...ast.root.scripts].sort(
    (a, b) => a.root.start! - b.root.start!,
  );
  let currentIndex = 0;
  let html = '';
  for (const script of sortedScripts) {
    html += ast.rawContent.substring(currentIndex, script.root.start!);
    html += '\n';
    html += context.print(script, context);
    html += '\n';
    currentIndex = script.root.end!;
  }
  html += ast.rawContent.substr(currentIndex);
  return html;
};
