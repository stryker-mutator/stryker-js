import babel from '@babel/core';
import { NodeMutator } from './node-mutator.js';

const { types } = babel;

export const emptyExpressionMutator: NodeMutator = {
  name: 'CallExpression',

  *mutate(path) {
    if (path.node.type === 'ExpressionStatement') {
      if (
        path.node.expression.type === 'CallExpression' &&
        path.node.expression.arguments.length === 0
      ) {
        yield types.emptyStatement();
      }
    }

    if (path.node.type === 'ThrowStatement')
      if (
        path.node.argument.type === 'NewExpression' &&
        path.node.argument.arguments.length === 0
      ) {
        yield types.emptyStatement();
      }
  },
};
