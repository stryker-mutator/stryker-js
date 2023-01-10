import { notEmpty } from '@stryker-mutator/util';

import { AstFormat } from '../syntax/index.js';

import { placeHeaderIfNeeded } from '../util/syntax-helpers.js';

import { AstTransformer } from './transformer';

export const transformSvelte: AstTransformer<AstFormat.Svelte> = ({ root, originFileName }, mutantCollector, context) => {
  [root.mainScript, ...root.additionalScripts]
    .filter(notEmpty)
    .sort((a, b) => a.range.start - b.range.start)
    .forEach((script) => {
      context.transform(script.ast, mutantCollector, {
        ...context,
        options: {
          ...context.options,
          noHeader: true,
        },
      });
    });

  placeHeaderIfNeeded(mutantCollector, originFileName, context.options, root.mainScript.ast.root);
};
