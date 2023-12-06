import babel from '@babel/core';

import { NodeMutator } from './index.js';

const { types } = babel;

export const objectLiteralMutator: NodeMutator = {
  name: 'ObjectLiteral',

  *mutate(path, options) {
    if (path.isObjectExpression() && path.node.properties.length > 0 && isInMutationLevel(options)) {
      yield types.objectExpression([]);
    }
  },
};

function isInMutationLevel(operations: string[] | undefined): boolean {
  return operations === undefined || operations.length > 0;
}
