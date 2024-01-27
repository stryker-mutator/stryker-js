import type { types } from '@babel/core';

import { AssignmentOperator } from '@stryker-mutator/api/core';

import { deepCloneNode } from '../util/index.js';

import { NodeMutator } from './index.js';

const stringTypes = Object.freeze(['StringLiteral', 'TemplateLiteral']);
const stringAssignmentTypes = Object.freeze(['&&=', '||=', '??=']);

export const assignmentOperatorMutator: NodeMutator<AssignmentOperator> = {
  name: 'AssignmentOperator',

  operators: {
    '+=': { replacement: '-=', mutationName: 'AdditionAssignmentNegation' },
    '-=': { replacement: '+=', mutationName: 'SubtractionAssignmentNegation' },
    '*=': { replacement: '/=', mutationName: 'MultiplicationAssignmentNegation' },
    '/=': { replacement: '*=', mutationName: 'DivisionAssignmentNegation' },
    '%=': { replacement: '*=', mutationName: 'RemainderAssignmentToMultiplicationReplacement' },
    '<<=': { replacement: '>>=', mutationName: 'LeftShiftAssignmentNegation' },
    '>>=': { replacement: '<<=', mutationName: 'RightShiftAssignmentNegation' },
    '&=': { replacement: '|=', mutationName: 'BitwiseAndAssignmentToBitwiseOrReplacement' },
    '|=': { replacement: '&=', mutationName: 'BitwiseOrAssignmentToBitwiseAndReplacement' },
    '&&=': { replacement: '||=', mutationName: 'LogicalAndAssignmentToLogicalOrReplacement' },
    '||=': { replacement: '&&=', mutationName: 'LogicalOrAssignmentToLogicalAndReplacement' },
    '??=': { replacement: '&&=', mutationName: 'NullishCoalescingAssignmentToLogicalAndReplacement' },
  },

  *mutate(path, levelMutations) {
    if (
      path.isAssignmentExpression() &&
      isSupportedAssignmentOperator(path.node.operator) &&
      isSupported(path.node) &&
      isInMutationLevel(path.node, levelMutations)
    ) {
      const mutatedOperator = this.operators[path.node.operator].replacement;
      const replacementOperator = deepCloneNode(path.node);
      replacementOperator.operator = mutatedOperator;
      yield replacementOperator;
    }
  },

  numberOfMutants(path): number {
    return path.isAssignmentExpression() && isSupportedAssignmentOperator(path.node.operator) && isSupported(path.node) ? 1 : 0;
  },
};

function isInMutationLevel(node: types.AssignmentExpression, operations: string[] | undefined): boolean {
  if (operations === undefined) {
    return true;
  }
  const { mutationName } = assignmentOperatorMutator.operators[node.operator];
  return operations.some((op) => op === mutationName);
}

function isSupportedAssignmentOperator(operator: string): boolean {
  return Object.keys(assignmentOperatorMutator.operators).includes(operator);
}

function isSupported(node: types.AssignmentExpression): boolean {
  // Excludes assignment operators that apply to strings.
  if (stringTypes.includes(node.right.type) && !stringAssignmentTypes.includes(node.operator)) {
    return false;
  }

  return true;
}
