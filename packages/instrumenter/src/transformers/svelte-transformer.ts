import { notEmpty } from '@stryker-mutator/util';

import { AstFormat } from '../syntax';

import { instrumentationBabelHeaderAsString } from '../util/syntax-helpers.js';

import { AstTransformer } from './transformer';

export const transformSvelte: AstTransformer<AstFormat.Svelte> = ({ root }, mutantCollector, context) => {
  [root.mainScript, ...root.additionalScripts]
    .filter(notEmpty)
    .filter((script) => script.ast.rawContent !== instrumentationBabelHeaderAsString)
    .sort((a, b) => a.range.start - b.range.start)
    .forEach((script) => {
      const noHeader = script !== root.mainScript;
      context.transform(script.ast, mutantCollector, {
        ...context,
        options: {
          ...context.options,
          noHeader,
        },
      });
    });
};
