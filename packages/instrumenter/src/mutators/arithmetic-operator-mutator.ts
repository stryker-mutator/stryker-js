import type { types } from '@babel/core';

import { deepCloneNode } from '../util/index.js';

import { NodeMutatorConfiguration } from '../mutation-level/mutation-level.js';

import { NodeMutator } from './node-mutator.js';

const operators: NodeMutatorConfiguration = {
  '+': { replacement: '-', mutationName: '+To-' },
  '-': { replacement: '+', mutationName: '-To+' },
  '*': { replacement: '/', mutationName: '*To/' },
  '/': { replacement: '*', mutationName: '/To*' },
  '%': { replacement: '*', mutationName: '%To*' },
};

export const arithmeticOperatorMutator: NodeMutator = {
  name: 'ArithmeticOperator',

  *mutate(path, levelMutations) {
    if (path.isBinaryExpression() && isSupported(path.node.operator, path.node) && isInMutationLevel(path.node, levelMutations)) {
      const mutatedOperator = operators[path.node.operator].replacement;
      const replacement = deepCloneNode(path.node);
      replacement.operator = mutatedOperator;
      yield replacement;
    }
  },
};

function isInMutationLevel(node: types.BinaryExpression, operations: string[] | undefined): boolean {
  // No mutation level specified, so allow everything
  if (operations === undefined) {
    return true;
  }

  const mutatedOperator = operators[node.operator as keyof typeof operators].mutationName;
  return operations.some((op) => op === mutatedOperator) ?? false;
}

function isSupported(operator: string, node: types.BinaryExpression): operator is keyof typeof operators {
  if (!Object.keys(operators).includes(operator)) {
    return false;
  }

  const stringTypes = ['StringLiteral', 'TemplateLiteral'];
  const leftType = node.left.type === 'BinaryExpression' ? node.left.right.type : node.left.type;

  if (stringTypes.includes(node.right.type) || stringTypes.includes(leftType)) {
    return false;
  }

  return true;
}
