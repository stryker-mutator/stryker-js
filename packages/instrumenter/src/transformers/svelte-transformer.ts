import { AstFormat } from '../syntax';

import { AstTransformer } from './transformer';

export const transformSvelte: AstTransformer<AstFormat.Svelte> = ({ root }, mutantCollector, context) => {
  root.scripts.forEach((ast) => {
    context.transform(ast, mutantCollector, context);
  });
};
