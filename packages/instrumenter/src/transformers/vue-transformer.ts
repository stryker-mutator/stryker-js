import { notEmpty } from '@stryker-mutator/util';

import { AstFormat } from '../syntax/index.js';

import { AstTransformer } from './index.js';

export const transformVue: AstTransformer<AstFormat.Vue> = (
  { root },
  mutantCollector,
  context,
) => {
  [root.moduleScript, ...root.additionalScripts]
    .filter(notEmpty)
    .forEach((script) => {
      context.transform(script.ast, mutantCollector, context);
    });
};
