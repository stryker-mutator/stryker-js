import { notEmpty } from '@stryker-mutator/util';

import { SvelteAst } from '../syntax';
import { instrumentationBabelHeaderAsString } from '../util/index.js';

import { Printer } from './index.js';

export const print: Printer<SvelteAst> = ({ root, rawContent }, context) => {
  let currentIndex = 0;
  let offset = 0;
  let svelte = '';

  if (!root.mainScript && root.additionalScripts.length > 0) {
    const header = `<script>${instrumentationBabelHeaderAsString}</script>\n\n`;
    rawContent = header + rawContent;
    offset = header.length;
  }

  const sortedScripts = [root.mainScript, ...root.additionalScripts].filter(notEmpty).sort((a, b) => a.root.start! - b.root.start!);
  for (const script of sortedScripts) {
    svelte += rawContent.substring(currentIndex, script.root.start! + offset);
    svelte += '\n';
    svelte += context.print(script, context);
    svelte += '\n';
    currentIndex = script.root.end! + offset;
  }
  svelte += rawContent.substring(currentIndex);

  return svelte;
};
