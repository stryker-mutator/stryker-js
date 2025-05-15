import { AstFormat } from '../syntax/index.js';

import { AstTransformer } from './index.js';

export const transformHtml: AstTransformer<AstFormat.Html> = (
  { root },
  mutantCollector,
  context,
) => {
  root.scripts.forEach((ast) => {
    context.transform(ast, mutantCollector, context);
  });
};
