import { deepCloneNode } from '../util/index.js';

import { NodeMutator } from './index.js';

const logicalOperatorReplacements = Object.freeze({
  '&&': '||',
  '||': '&&',
  '??': '&&',
} as const);

export const logicalOperatorMutator: NodeMutator = {
  name: 'LogicalOperator',

  *mutate(path) {
    if (path.isLogicalExpression() && isSupported(path.node.operator)) {
      const mutatedOperator = logicalOperatorReplacements[path.node.operator];

      const replacement = deepCloneNode(path.node);
      replacement.operator = mutatedOperator;
      yield replacement;
    }
  },
};

function isSupported(
  operator: string,
): operator is keyof typeof logicalOperatorReplacements {
  return Object.keys(logicalOperatorReplacements).includes(operator);
}
