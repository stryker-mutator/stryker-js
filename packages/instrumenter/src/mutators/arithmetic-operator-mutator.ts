import babel, { type types } from '@babel/core';

import { NodeMutator } from './node-mutator.js';

const { types: t } = babel;

enum ArithmeticOperators {
  '+' = '-',
  '-' = '+',
  '*' = '/',
  '/' = '*',
  '%' = '*',
}

export const arithmeticOperatorMutator: NodeMutator = {
  name: 'ArithmeticOperator',

  *mutate(path) {
    if (path.isBinaryExpression() && isSupported(path.node.operator, path.node)) {
      const mutatedOperator = ArithmeticOperators[path.node.operator];
      const replacement = t.cloneNode(path.node, false);
      replacement.operator = mutatedOperator;
      yield replacement;
    }
  },
};

function isSupported(operator: string, node: types.BinaryExpression): operator is keyof typeof ArithmeticOperators {
  if (!Object.keys(ArithmeticOperators).includes(operator)) {
    return false;
  }

  const stringTypes = ['StringLiteral', 'TemplateLiteral'];
  const leftType = node.left.type === 'BinaryExpression' ? node.left.right.type : node.left.type;

  if (stringTypes.includes(node.right.type) || stringTypes.includes(leftType)) {
    return false;
  }

  return true;
}
