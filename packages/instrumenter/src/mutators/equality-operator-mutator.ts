import { types } from '@babel/core';

import { NodeMutator } from './node-mutator';

const operators = {
  '<': ['<=', '>='],
  '<=': ['<', '>'],
  '>': ['>=', '<='],
  '>=': ['>', '<'],
  '==': ['!='],
  '!=': ['=='],
  '===': ['!=='],
  '!==': ['==='],
} as const;

function isEqualityOperator(operator: string): operator is keyof typeof operators {
  return Object.keys(operators).includes(operator);
}
export const equalityOperatorMutator: NodeMutator = {
  name: 'EqualityOperator',

  *mutate(path) {
    if (path.isBinaryExpression() && isEqualityOperator(path.node.operator)) {
      for (const mutableOperator of operators[path.node.operator]) {
        const replacement = types.cloneNode(path.node, true);
        replacement.operator = mutableOperator;
        yield replacement;
      }
    }
  },
};
