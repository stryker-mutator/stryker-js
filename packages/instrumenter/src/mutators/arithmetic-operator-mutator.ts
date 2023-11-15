import type { types } from '@babel/core';

import { MutationLevel } from '@stryker-mutator/api/core';

import { deepCloneNode } from '../util/index.js';

import { NodeMutator } from './node-mutator.js';

const arithmeticOperatorReplacements = Object.freeze({
  '+': { replacement: '-', mutatorName: '+To-' },
  '-': { replacement: '+', mutatorName: '-To+' },
  '*': { replacement: '/', mutatorName: '*To/' },
  '/': { replacement: '*', mutatorName: '/To*' },
  '%': { replacement: '*', mutatorName: '%To*' },
} as const);

export const arithmeticOperatorMutator: NodeMutator = {
  name: 'ArithmeticOperator',

  *mutate(path, options) {
    if (path.isBinaryExpression() && isSupported(path.node.operator, path.node) && isInMutationLevel(path.node, options)) {
      const mutatedOperator = arithmeticOperatorReplacements[path.node.operator].replacement;
      const replacement = deepCloneNode(path.node);
      replacement.operator = mutatedOperator;
      yield replacement;
    }
  },
};

function isInMutationLevel(node: types.BinaryExpression, level?: MutationLevel): boolean {
  // No mutation level specified, so allow everything
  if (level === undefined) {
    return true;
  }

  if (level.ArithmeticOperator === undefined) {
    return false;
  }

  const mutatedOperator = arithmeticOperatorReplacements[node.operator as keyof typeof arithmeticOperatorReplacements].mutatorName;
  return level.ArithmeticOperator.some((op) => op === mutatedOperator) ?? false;
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
