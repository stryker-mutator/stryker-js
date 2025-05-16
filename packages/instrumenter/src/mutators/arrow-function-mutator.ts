import babel from '@babel/core';

const { types } = babel;

import { NodeMutator } from './index.js';

export const arrowFunctionMutator: NodeMutator = {
  name: 'ArrowFunction',

  *mutate(path) {
    if (
      path.isArrowFunctionExpression() &&
      !types.isBlockStatement(path.node.body) &&
      !(
        types.isIdentifier(path.node.body) &&
        path.node.body.name === 'undefined'
      )
    ) {
      yield types.arrowFunctionExpression([], types.identifier('undefined'));
    }
  },
};
