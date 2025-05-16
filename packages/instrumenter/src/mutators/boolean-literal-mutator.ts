import babel from '@babel/core';

import { deepCloneNode } from '../util/index.js';

const { types } = babel;

import { NodeMutator } from './index.js';

export const booleanLiteralMutator: NodeMutator = {
  name: 'BooleanLiteral',

  *mutate(path) {
    if (path.isBooleanLiteral()) {
      yield types.booleanLiteral(!path.node.value);
    }
    if (
      path.isUnaryExpression() &&
      path.node.operator === '!' &&
      path.node.prefix
    ) {
      yield deepCloneNode(path.node.argument);
    }
  },
};
