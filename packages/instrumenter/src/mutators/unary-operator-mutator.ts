import babel from '@babel/core';

import { UnaryOperator } from '@stryker-mutator/api/core';

import { deepCloneNode } from '../util/index.js';

import { NodeMutator } from './index.js';

const { types } = babel;

export const unaryOperatorMutator: NodeMutator<UnaryOperator> = {
  name: 'UnaryOperator',

  operators: {
    '+': { replacement: '-', mutationName: 'UnaryPlusOperatorNegation' },
    '-': { replacement: '+', mutationName: 'UnaryMinOperatorNegation' },
    '~': { replacement: '', mutationName: 'UnaryBitwiseNotRemoval' },
  },

  *mutate(path, levelMutations) {
    if (path.isUnaryExpression() && isSupported(path.node.operator) && path.node.prefix) {
      const mutation = this.operators[path.node.operator];

      if (levelMutations !== undefined && !levelMutations.includes(mutation.mutationName)) {
        // Mutator not allowed by MutationLevel
        return;
      }

      const replacementOperator = mutation.replacement.length
        ? types.unaryExpression(mutation.replacement as '-' | '+', deepCloneNode(path.node.argument))
        : deepCloneNode(path.node.argument);

      yield replacementOperator;
    }
  },

  numberOfMutants(path): number {
    return path.isUnaryExpression() && isSupported(path.node.operator) && path.node.prefix ? 1 : 0;
  },
};

function isSupported(operator: string): operator is keyof typeof unaryOperatorMutator.operators {
  return operator in unaryOperatorMutator.operators;
}
