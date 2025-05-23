import babel from '@babel/core';

import { deepCloneNode } from '../util/index.js';

import { NodeMutator } from './index.js';

const { types } = babel;

enum UnaryOperator {
  '+' = '-',
  '-' = '+',
  '~' = '',
}

export const unaryOperatorMutator: NodeMutator = {
  name: 'UnaryOperator',

  *mutate(path) {
    if (
      path.isUnaryExpression() &&
      isSupported(path.node.operator) &&
      path.node.prefix
    ) {
      const mutatedOperator = UnaryOperator[path.node.operator];
      const replacement = mutatedOperator.length
        ? types.unaryExpression(
            mutatedOperator as '-' | '+',
            deepCloneNode(path.node.argument),
          )
        : deepCloneNode(path.node.argument);

      yield replacement;
    }
  },
};

function isSupported(operator: string): operator is keyof typeof UnaryOperator {
  return Object.keys(UnaryOperator).includes(operator);
}
