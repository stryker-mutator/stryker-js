import { deepCloneNode } from '../util/index.js';

import { NodeMutator } from './index.js';

const operators = Object.freeze({
  '&&': { replacement: '||', mutatorName: '&&To||' },
  '||': { replacement: '&&', mutatorName: '||To&&' },
  '??': { replacement: '&&', mutatorName: '??To&&' },
} as const);

export const logicalOperatorMutator: NodeMutator = {
  name: 'LogicalOperator',

  *mutate(path, operations) {
    if (path.isLogicalExpression() && isSupported(path.node.operator) && isInMutationLevel(path.node.operator, operations)) {
      const mutatedOperator = operators[path.node.operator].replacement;

      const replacement = deepCloneNode(path.node);
      replacement.operator = mutatedOperator;
      yield replacement;
    }
  },
};

function isSupported(operator: string): operator is keyof typeof operators {
  return Object.keys(operators).includes(operator);
}

function isInMutationLevel(operator: string, operations: string[] | undefined): operator is keyof typeof operators {
  return operations === undefined || operations.some((op) => op.startsWith(operator));
}
