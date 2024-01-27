import { LogicalOperator } from '@stryker-mutator/api/core';

import { deepCloneNode } from '../util/index.js';

import { NodeMutator } from './index.js';

export const logicalOperatorMutator: NodeMutator<LogicalOperator> = {
  name: 'LogicalOperator',

  operators: {
    '&&': { replacement: '||', mutationName: 'LogicalAndOperatorToLogicalOrReplacement' },
    '||': { replacement: '&&', mutationName: 'LogicalOrOperatorToLogicalAndReplacement' },
    '??': { replacement: '&&', mutationName: 'NullishCoalescingOperatorToLogicalAndReplacement' },
  },

  *mutate(path, levelMutations) {
    if (path.isLogicalExpression() && isSupported(path.node.operator) && isInMutationLevel(path.node.operator, levelMutations)) {
      const mutatedOperator = this.operators[path.node.operator].replacement;

      const replacementOperator = deepCloneNode(path.node);
      replacementOperator.operator = mutatedOperator;
      yield replacementOperator;
    }
  },

  numberOfMutants(path): number {
    return path.isLogicalExpression() && isSupported(path.node.operator) ? 1 : 0;
  },
};

function isSupported(operator: string): operator is keyof typeof logicalOperatorMutator.operators {
  return Object.keys(logicalOperatorMutator.operators).includes(operator);
}

function isInMutationLevel(operator: string, levelMutations: string[] | undefined): boolean {
  return levelMutations === undefined || levelMutations.includes(logicalOperatorMutator.operators[operator].mutationName as string);
}
