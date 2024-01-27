import type { types } from '@babel/core';

import { AssignmentOperator } from '@stryker-mutator/api/core';

import { deepCloneNode } from '../util/index.js';

import { NodeMutator } from './index.js';

const stringTypes = Object.freeze(['StringLiteral', 'TemplateLiteral']);
const stringAssignmentTypes = Object.freeze(['&&=', '||=', '??=']);

export const assignmentOperatorMutator: NodeMutator<AssignmentOperator> = {
  name: 'AssignmentOperator',

  operators: {
    '+=': { replacement: '-=', mutationOperator: 'AdditionAssignmentNegation' },
    '-=': { replacement: '+=', mutationOperator: 'SubtractionAssignmentNegation' },
    '*=': { replacement: '/=', mutationOperator: 'MultiplicationAssignmentNegation' },
    '/=': { replacement: '*=', mutationOperator: 'DivisionAssignmentNegation' },
    '%=': { replacement: '*=', mutationOperator: 'RemainderAssignmentToMultiplicationReplacement' },
    '<<=': { replacement: '>>=', mutationOperator: 'LeftShiftAssignmentNegation' },
    '>>=': { replacement: '<<=', mutationOperator: 'RightShiftAssignmentNegation' },
    '&=': { replacement: '|=', mutationOperator: 'BitwiseAndAssignmentToBitwiseOrReplacement' },
    '|=': { replacement: '&=', mutationOperator: 'BitwiseOrAssignmentToBitwiseAndReplacement' },
    '&&=': { replacement: '||=', mutationOperator: 'LogicalAndAssignmentToLogicalOrReplacement' },
    '||=': { replacement: '&&=', mutationOperator: 'LogicalOrAssignmentToLogicalAndReplacement' },
    '??=': { replacement: '&&=', mutationOperator: 'NullishCoalescingAssignmentToLogicalAndReplacement' },
  },

  *mutate(path) {
    if (path.isAssignmentExpression() && isSupportedAssignmentOperator(path.node.operator) && isSupported(path.node)) {
      const { replacement, mutationOperator } = this.operators[path.node.operator];
      const nodeClone = deepCloneNode(path.node);
      nodeClone.operator = replacement as string;
      yield [nodeClone, mutationOperator];
    }
  },
};

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
