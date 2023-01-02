import { I, notEmpty } from '@stryker-mutator/util';

import { AstFormat } from '../syntax/index.js';

import { instrumentationBabelHeaderAsString } from '../util/syntax-helpers.js';

import { transformBabel } from './babel-transformer.js';
import { MutantCollector } from './mutant-collector';

import { AstTransformer, TransformerContext } from './transformer';

export const transformSvelte: AstTransformer<AstFormat.Svelte> = ({ root, rawContent, originFileName }, mutantCollector, context) => {
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

  root.bindingExpressions?.filter(notEmpty).forEach((expression) => {
    transformBabelWithSettings(
      expression.ast,
      rawContent.slice(expression.range.start, expression.range.end),
      originFileName,
      mutantCollector,
      context
    );
  });
};

function transformBabelWithSettings(astBabel: any, text: string, fileName: string, mutantCollector: I<MutantCollector>, context: TransformerContext) {
  transformBabel(
    {
      root: astBabel,
      originFileName: fileName,
      rawContent: text,
      offset: undefined,
      format: AstFormat.JS,
    },
    mutantCollector,
    {
      ...context,
      mutateDescription: [
        {
          start: { column: 0, line: 0 },
          end: { column: Number.MAX_SAFE_INTEGER, line: Number.MAX_SAFE_INTEGER },
        },
      ],
      options: { excludedMutations: ['BlockStatement', 'ArrowFunction'], noHeader: true },
    }
  );
}
