import babel from '@babel/core';

import { NodeMutator } from './index.js';

const { types } = babel;

export const objectLiteralMutator: NodeMutator = {
  name: 'ObjectLiteral',

  *mutate(path) {
    if (path.isObjectExpression() && path.node.properties.length > 0) {
      yield types.objectExpression([]);
    }
  },
};
