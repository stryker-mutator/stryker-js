import babel from '@babel/core';
import { NodeMutator } from './node-mutator.js';

const { types } = babel;

function isSuperCall(expression: babel.types.CallExpression): boolean {
  return expression.callee.type === 'Super';
}

function voidZero(): babel.types.UnaryExpression {
  return types.unaryExpression('void', types.numericLiteral(0), true);
}

export const emptyExpressionMutator: NodeMutator = {
  name: 'CallExpression',

  *mutate(path, context) {
    if (
      path.isCallExpression() &&
      context.isExpressionContext &&
      !isSuperCall(path.node)
    ) {
      yield voidZero();
      return;
    }

    if (context.isExpressionContext) {
      return;
    }

    if (path.node.type === 'ExpressionStatement') {
      if (
        path.node.expression.type === 'CallExpression' &&
        !isSuperCall(path.node.expression)
      ) {
        yield types.emptyStatement();
      }
    }

    if (path.node.type === 'ThrowStatement')
      if (path.node.argument.type === 'NewExpression') {
        yield types.emptyStatement();
      }
  },

  filter(mutantsInScope) {
    return mutantsInScope.length === 1;
  },
};
