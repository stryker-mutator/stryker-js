import * as types from '@babel/types';

import { NodeMutator } from './index.js';

export const objectLiteralMutator: NodeMutator = {
  name: 'ObjectLiteral',

  *mutate(path) {
    if (path.isObjectExpression() && path.node.properties.length > 0) {
      yield types.objectExpression([]);
    }
  },
};
