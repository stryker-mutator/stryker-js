import babel from '@babel/core';

import { deepCloneNode } from '../util/index.js';

import { NodeMutator } from './index.js';

const { types } = babel;

const operators = Object.freeze({
  '+': { replacement: '-', mutatorName: '+To-' },
  '-': { replacement: '+', mutatorName: '-To+' },
  '~': { replacement: '', mutatorName: 'remove~' },
});

export const unaryOperatorMutator: NodeMutator = {
  name: 'UnaryOperator',

  *mutate(path, operations) {
    if (path.isUnaryExpression() && isSupported(path.node.operator) && path.node.prefix) {
      const mutation = operators[path.node.operator];

      if (operations !== undefined && !operations.includes(mutation.mutatorName)) {
        // Mutator not allowed by MutationLevel
        return;
      }

      const replacement = mutation.replacement.length
        ? types.unaryExpression(mutation.replacement as '-' | '+', deepCloneNode(path.node.argument))
        : deepCloneNode(path.node.argument);

      yield replacement;
    }
  },
};

function isSupported(operator: string): operator is keyof typeof operators {
  return operator in operators;
}
