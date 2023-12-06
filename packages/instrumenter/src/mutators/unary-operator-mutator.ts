import babel from '@babel/core';

import { deepCloneNode } from '../util/index.js';

import { NodeMutatorConfiguration } from '../mutation-level/mutation-level.js';

import { NodeMutator } from './index.js';

const { types } = babel;

const operators: NodeMutatorConfiguration = {
  '+': { replacement: '-', mutationName: '+To-' },
  '-': { replacement: '+', mutationName: '-To+' },
  '~': { replacement: '', mutationName: 'remove~' },
};

export const unaryOperatorMutator: NodeMutator = {
  name: 'UnaryOperator',

  *mutate(path, levelMutations) {
    if (path.isUnaryExpression() && isSupported(path.node.operator) && path.node.prefix) {
      const mutation = operators[path.node.operator];

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
};

function isSupported(operator: string): operator is keyof typeof operators {
  return operator in operators;
}
