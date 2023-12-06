import { NodeMutatorConfiguration } from '../mutation-level/mutation-level.js';
import { deepCloneNode } from '../util/index.js';

import { NodeMutator } from './index.js';

const operators: NodeMutatorConfiguration = {
  '&&': { replacement: '||', mutationName: '&&To||' },
  '||': { replacement: '&&', mutationName: '||To&&' },
  '??': { replacement: '&&', mutationName: '??To&&' },
};

export const logicalOperatorMutator: NodeMutator = {
  name: 'LogicalOperator',

  *mutate(path, levelMutations) {
    if (path.isLogicalExpression() && isSupported(path.node.operator) && isInMutationLevel(path.node.operator, levelMutations)) {
      const mutatedOperator = operators[path.node.operator].replacement;

      const replacementOperator = deepCloneNode(path.node);
      replacementOperator.operator = mutatedOperator;
      yield replacementOperator;
    }
  },
};

function isSupported(operator: string): operator is keyof typeof operators {
  return Object.keys(operators).includes(operator);
}

function isInMutationLevel(operator: string, levelMutations: string[] | undefined): operator is keyof typeof operators {
  return levelMutations === undefined || levelMutations.some((op) => op.startsWith(operator));
}
