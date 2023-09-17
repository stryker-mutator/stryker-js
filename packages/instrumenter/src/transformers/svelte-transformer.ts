import { AstFormat } from '../syntax/index.js';

import { placeHeaderIfNeeded } from '../util/syntax-helpers.js';

import { AstTransformer } from './transformer.js';

export const transformSvelte: AstTransformer<AstFormat.Svelte> = ({ root, originFileName }, mutantCollector, context) => {
  [root.mainScript, ...root.additionalScripts]
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
