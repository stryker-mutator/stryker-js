import babel from '@babel/core';

const { types } = babel;

import { ArrowFunction } from '@stryker-mutator/api/core';

import { NodeMutator } from './index.js';

export const arrowFunctionMutator: NodeMutator<ArrowFunction> = {
  name: 'ArrowFunction',

  operators: {
    ArrowFunctionRemoval: { mutationName: 'ArrowFunctionRemoval' },
  },

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

function isInMutationLevel(levelMutations: string[] | undefined): boolean {
  return levelMutations === undefined || levelMutations.includes(arrowFunctionMutator.operators.ArrowFunctionRemoval.mutationName);
}
