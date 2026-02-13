import babel from '@babel/core';
import { NodeMutator } from './node-mutator.js';

const { types } = babel;

export const emptyExpressionMutator: NodeMutator = {
  name: 'CallExpression',

  *mutate(path) {
    if (path.node.type === 'ExpressionStatement') {
      if (path.node.expression.type === 'CallExpression') {
        yield types.emptyStatement();
      }
    }

    if (path.node.type === 'ThrowStatement')
      if (path.node.argument.type === 'NewExpression') {
        yield types.emptyStatement();
      }
  },

  filter(mutantsInScope) {
    if (mutantsInScope.length > 0) {
      return false;
    }

    return true;
  },
};
