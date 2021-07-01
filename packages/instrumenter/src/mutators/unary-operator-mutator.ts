import * as types from '@babel/types';

import { NodeMutator } from '.';

enum UnaryOperator {
  '+' = '-',
  '-' = '+',
  '~' = '',
}

export const unaryOperatorMutator: NodeMutator = {
  name: 'UnaryOperator',

  *mutate(path) {
    if (path.isUnaryExpression() && isSupported(path.node.operator) && path.node.prefix) {
      const mutatedOperator = UnaryOperator[path.node.operator];
      const replacement = mutatedOperator.length
        ? types.unaryExpression(mutatedOperator as '-' | '+', path.node.argument)
        : types.cloneNode(path.node.argument, true);

      yield replacement;
    }
  },
};

function isSupported(operator: string): operator is keyof typeof UnaryOperator {
  return Object.keys(UnaryOperator).includes(operator);
}
