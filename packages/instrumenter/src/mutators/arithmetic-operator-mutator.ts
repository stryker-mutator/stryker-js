import type { types } from '@babel/core';

import { MutationLevel } from '@stryker-mutator/api/core';

import { deepCloneNode } from '../util/index.js';

import { NodeMutator } from './node-mutator.js';

const arithmeticOperatorReplacements = Object.freeze({
  '+': '-',
  '-': '+',
  '*': '/',
  '/': '*',
  '%': '*',
} as const);

export const arithmeticOperatorMutator: NodeMutator = {
  name: 'ArithmeticOperator',

  *mutate(path, options) {
    if (path.isBinaryExpression() && isSupported(path.node.operator, path.node) && isInMutationLevel(path.node.operator, options)) {
      const mutatedOperator = arithmeticOperatorReplacements[path.node.operator];
      const replacement = deepCloneNode(path.node);
      replacement.operator = mutatedOperator;
      yield replacement;
    }
  },
};

function isInMutationLevel(operator: string, level?: MutationLevel): boolean {
  if (level === undefined) {
    return true;
  }
  if (level.ArithmeticOperator === undefined) {
    return false;
  }
  switch (operator) {
    case '+':
      return level.ArithmeticOperator.some((op) => op === '+To-') ?? false;
    case '-':
      return level.ArithmeticOperator.some((op) => op === '-To+') ?? false;
    case '*':
      return level.ArithmeticOperator.some((op) => op === '*To/') ?? false;
    case '/':
      return level.ArithmeticOperator.some((op) => op === '/To*') ?? false;
    case '%':
      return level.ArithmeticOperator.some((op) => op === '%To*') ?? false;
    default:
      return false;
  }
}

function isSupported(operator: string, node: types.BinaryExpression): operator is keyof typeof arithmeticOperatorReplacements {
  if (!Object.keys(arithmeticOperatorReplacements).includes(operator)) {
    return false;
  }

  const stringTypes = ['StringLiteral', 'TemplateLiteral'];
  const leftType = node.left.type === 'BinaryExpression' ? node.left.right.type : node.left.type;

  if (stringTypes.includes(node.right.type) || stringTypes.includes(leftType)) {
    return false;
  }

  return true;
}
