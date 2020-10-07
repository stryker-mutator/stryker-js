import { AstFormat } from '../syntax';

import { AstTransformer } from '.';

export const transformHtml: AstTransformer<AstFormat.Html> = ({ root }, mutantCollector, context) => {
  root.scripts.forEach((ast) => {
    context.transform(ast, mutantCollector, context);
  });
};
