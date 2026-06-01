import { deepCloneNode } from '../util/index.js';

import { NodeMutator } from './node-mutator.js';

const bitwiseOperatorReplacements = Object.freeze({
  '&': '|',
  '|': '&',
  '^': '&',
  '<<': '>>',
  '>>': '<<',
  '>>>': '>>',
} as const);

export const bitwiseOperatorMutator: NodeMutator = {
  name: 'BitwiseOperator',

  *mutate(path) {
    if (path.isBinaryExpression() && isSupported(path.node.operator)) {
      const mutatedOperator = bitwiseOperatorReplacements[path.node.operator];
      const replacement = deepCloneNode(path.node);
      replacement.operator = mutatedOperator;
      yield replacement;
    }
  },
};

function isSupported(
  operator: string,
): operator is keyof typeof bitwiseOperatorReplacements {
  return Object.keys(bitwiseOperatorReplacements).includes(operator);
}
