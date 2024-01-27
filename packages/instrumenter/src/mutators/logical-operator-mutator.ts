import { LogicalOperator } from '@stryker-mutator/api/core';

import { deepCloneNode } from '../util/index.js';

import { NodeMutator } from './index.js';

export const logicalOperatorMutator: NodeMutator<LogicalOperator> = {
  name: 'LogicalOperator',

  operators: {
    '&&': { replacement: '||', mutationOperator: 'LogicalAndOperatorToLogicalOrReplacement' },
    '||': { replacement: '&&', mutationOperator: 'LogicalOrOperatorToLogicalAndReplacement' },
    '??': { replacement: '&&', mutationOperator: 'NullishCoalescingOperatorToLogicalAndReplacement' },
  },

  *mutate(path) {
    if (path.isLogicalExpression() && isSupported(path.node.operator)) {
      const { replacement, mutationOperator } = this.operators[path.node.operator];

      const nodeClone = deepCloneNode(path.node);
      nodeClone.operator = replacement as babel.types.LogicalExpression['operator'];
      yield [nodeClone, mutationOperator];
    }
  },
};

function isSupported(operator: string): operator is keyof typeof logicalOperatorMutator.operators {
  return Object.keys(logicalOperatorMutator.operators).includes(operator);
}
