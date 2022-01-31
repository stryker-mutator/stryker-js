import * as types from '@babel/types';

import { NodeMutator } from './index.js';

export const booleanLiteralMutator: NodeMutator = {
  name: 'BooleanLiteral',

  *mutate(path) {
    if (path.isBooleanLiteral()) {
      yield types.booleanLiteral(!path.node.value);
    }
    if (path.isUnaryExpression() && path.node.operator === '!' && path.node.prefix) {
      yield types.cloneNode(path.node.argument, true);
    }
  },
};
