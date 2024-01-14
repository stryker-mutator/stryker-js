import type { types } from '@babel/core';

import { ArithmeticOperator } from '@stryker-mutator/api/core';

import { deepCloneNode } from '../util/index.js';

import { NodeMutator } from './node-mutator.js';

export const arithmeticOperatorMutator: NodeMutator<ArithmeticOperator> = {
  name: 'ArithmeticOperator',

  operators: {
    '+': { replacement: '-', mutationName: 'AdditionOperatorNegation' },
    '-': { replacement: '+', mutationName: 'SubtractionOperatorNegation' },
    '*': { replacement: '/', mutationName: 'MultiplicationOperatorNegation' },
    '/': { replacement: '*', mutationName: 'DivisionOperatorNegation' },
    '%': { replacement: '*', mutationName: 'RemainderOperatorToMultiplicationReplacement' },
  },

  *mutate(path, levelMutations) {
    if (path.isBinaryExpression() && isSupported(path.node.operator, path.node) && isInMutationLevel(path.node, levelMutations)) {
      const mutatedOperator = this.operators[path.node.operator].replacement;
      const replacement = deepCloneNode(path.node);
      replacement.operator = mutatedOperator;
      yield replacement;
    }
  },

  numberOfMutants(path): number {
    return path.isBinaryExpression() && isSupported(path.node.operator, path.node) ? 1 : 0;
  },
};

function isInMutationLevel(node: types.BinaryExpression, operations: string[] | undefined): boolean {
  // No mutation level specified, so allow everything
  if (operations === undefined) {
    return true;
  }

  const mutatedOperator = arithmeticOperatorMutator.operators[node.operator].mutationName;
  return operations.some((op) => op === mutatedOperator);
}

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
