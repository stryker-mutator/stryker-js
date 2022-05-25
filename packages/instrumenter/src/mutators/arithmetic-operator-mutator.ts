import { type types } from '@babel/core';

import { deepCloneNode } from '../util/index.js';

import { NodeMutator } from './node-mutator.js';

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
      const replacement = deepCloneNode(path.node);
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
