import babel from '@babel/core';

const { types } = babel;

import { NodeMutator } from './index.js';

export const arrowFunctionMutator: NodeMutator = {
  name: 'ArrowFunction',

  *mutate(path, levelMutations) {
    if (
      path.isArrowFunctionExpression() &&
      !types.isBlockStatement(path.node.body) &&
      !(types.isIdentifier(path.node.body) && path.node.body.name === 'undefined') &&
      isInMutationLevel(levelMutations)
    ) {
      yield types.arrowFunctionExpression([], types.identifier('undefined'));
    }
  },
};

function isInMutationLevel(operations: string[] | undefined): boolean {
  return operations === undefined || operations.length > 0;
}
