import type { types } from '@babel/core';

import { ArithmeticOperator } from '@stryker-mutator/api/core';

import { deepCloneNode } from '../util/index.js';

import { NodeMutator } from './node-mutator.js';

export const arithmeticOperatorMutator: NodeMutator<ArithmeticOperator> = {
  name: 'ArithmeticOperator',

  operators: {
    '+': { replacement: '-', mutationOperator: 'AdditionOperatorNegation' },
    '-': { replacement: '+', mutationOperator: 'SubtractionOperatorNegation' },
    '*': { replacement: '/', mutationOperator: 'MultiplicationOperatorNegation' },
    '/': { replacement: '*', mutationOperator: 'DivisionOperatorNegation' },
    '%': { replacement: '*', mutationOperator: 'RemainderOperatorToMultiplicationReplacement' },
  },

  *mutate(path) {
    if (path.isBinaryExpression() && isSupported(path.node.operator, path.node)) {
      const { replacement, mutationOperator } = this.operators[path.node.operator];
      const nodeClone = deepCloneNode(path.node);
      nodeClone.operator = replacement as types.BinaryExpression['operator'];
      yield [nodeClone, mutationOperator];
    }
  },
};

function isSupported(operator: string, node: types.BinaryExpression): boolean {
  if (!Object.keys(arithmeticOperatorMutator.operators).includes(operator)) {
    return false;
  }

  const stringTypes = ['StringLiteral', 'TemplateLiteral'];
  const leftType = node.left.type === 'BinaryExpression' ? node.left.right.type : node.left.type;

  if (stringTypes.includes(node.right.type) || stringTypes.includes(leftType)) {
    return false;
  }

  return true;
}
