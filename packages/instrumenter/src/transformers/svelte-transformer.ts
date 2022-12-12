import { notEmpty } from '@stryker-mutator/util';

import { AstFormat } from '../syntax';

import { AstTransformer } from './transformer';

export const transformSvelte: AstTransformer<AstFormat.Svelte> = ({ root }, mutantCollector, context) => {
  [root.mainScript, ...root.additionalScripts]
    .filter(notEmpty)
    .sort((a, b) => a.root.start! - b.root.start!)
    .forEach((ast, index) => {
      if (index == 0 && root.mainScript) {
        context.options.header = true;
      } else {
        context.options.header = false;
      }
      context.transform(ast, mutantCollector, context);
    });
};
