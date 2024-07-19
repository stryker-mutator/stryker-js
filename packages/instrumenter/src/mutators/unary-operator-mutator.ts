import babel from '@babel/core';

import { UnaryOperator } from '@stryker-mutator/api/core';

import { deepCloneNode } from '../util/index.js';

import { NodeMutator } from './index.js';

const { types } = babel;

export const unaryOperatorMutator: NodeMutator<UnaryOperator> = {
  name: 'UnaryOperator',

  operators: {
    '+': { replacement: '-', mutationOperator: 'UnaryPlusOperatorNegation' },
    '-': { replacement: '+', mutationOperator: 'UnaryMinOperatorNegation' },
    '~': { replacement: '', mutationOperator: 'UnaryBitwiseNotRemoval' },
  },

  *mutate(path) {
    if (path.isUnaryExpression() && isSupported(path.node.operator) && path.node.prefix) {
      const { replacement, mutationOperator } = this.operators[path.node.operator];

      const nodeClone = (replacement as string).length
        ? types.unaryExpression(replacement as '-' | '+', deepCloneNode(path.node.argument))
        : deepCloneNode(path.node.argument);

      yield [nodeClone, mutationOperator];
    }
  },
};

function isSupported(operator: string): operator is keyof typeof unaryOperatorMutator.operators {
  return operator in unaryOperatorMutator.operators;
}
