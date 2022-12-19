import { notEmpty } from '@stryker-mutator/util';

import { AstFormat } from '../syntax';

import { AstTransformer } from './transformer';

export const transformSvelte: AstTransformer<AstFormat.Svelte> = ({ root }, mutantCollector, context) => {
  [root.mainScript, ...root.additionalScripts]
    .filter(notEmpty)
    .sort((a, b) => a.range.start - b.range.start)
    .forEach((script) => {
      if (script === root.mainScript) {
        context.options.noHeader = false;
      } else {
        context.options.noHeader = true;
      }
      context.transform(script.ast, mutantCollector, context);
    });
};
