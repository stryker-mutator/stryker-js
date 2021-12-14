import { types } from '@babel/core';

import { NodeMutator } from './node-mutator';

enum MethodExpressions {
  'forEach' = 'map',
  'map' = 'forEach',
  'filter' = 'reduce',
  'reduce' = 'filter',
  'some' = 'every',
  'every' = 'some',
  'from' = 'assign',
  'assign' = 'from',
  'slice' = 'split',
  'split' = 'slice',
}

function isSupported(operator: string): operator is MethodExpressions {
  return Object.keys(MethodExpressions).includes(operator);
}

export const methodExpressionsMutator: NodeMutator = {
  name: 'MethodExpression',

  *mutate(path) {
    if (path.isIdentifier() && isSupported(path.node.name)) {
      const mutatedOperator = MethodExpressions[path.node.name];
      const replacement = types.cloneNode(path.node, false);
      replacement.name = mutatedOperator;
      yield replacement;
    }
  },
};
