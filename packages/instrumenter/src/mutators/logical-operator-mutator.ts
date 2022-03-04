import babel from '@babel/core';

import { NodeMutator } from './index.js';

const { types } = babel;

enum LogicalOperatorMutationMap {
  '&&' = '||',
  '||' = '&&',
  '??' = '&&',
}

export const logicalOperatorMutator: NodeMutator = {
  name: 'LogicalOperator',

  *mutate(path) {
    if (path.isLogicalExpression() && isSupported(path.node.operator)) {
      const mutatedOperator = LogicalOperatorMutationMap[path.node.operator];

      const replacement = types.cloneNode(path.node, true);
      replacement.operator = mutatedOperator;
      yield replacement;
    }
  },
};

function isSupported(operator: string): operator is LogicalOperatorMutationMap {
  return Object.keys(LogicalOperatorMutationMap).includes(operator);
}
