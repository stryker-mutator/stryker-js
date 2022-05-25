import { deepCloneNode } from '../util/index.js';

import { NodeMutator } from './index.js';

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

      const replacement = deepCloneNode(path.node);
      replacement.operator = mutatedOperator;
      yield replacement;
    }
  },
};

function isSupported(operator: string): operator is LogicalOperatorMutationMap {
  return Object.keys(LogicalOperatorMutationMap).includes(operator);
}
