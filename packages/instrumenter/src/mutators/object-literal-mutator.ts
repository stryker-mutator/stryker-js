import babel from '@babel/core';

import { ObjectLiteral } from '@stryker-mutator/api/core';

import { NodeMutator } from './index.js';

const { types } = babel;

export const objectLiteralMutator: NodeMutator<ObjectLiteral> = {
  name: 'ObjectLiteral',

  operators: {
    ObjectLiteralPropertiesRemoval: { mutationName: 'ObjectLiteralPropertiesRemoval' },
  },

  *mutate(path, levelMutations) {
    if (path.isObjectExpression() && path.node.properties.length > 0 && isInMutationLevel(levelMutations)) {
      yield types.objectExpression([]);
    }
  },
};

function isInMutationLevel(levelMutations: string[] | undefined): boolean {
  return (
    levelMutations === undefined || levelMutations.includes(objectLiteralMutator.operators.ObjectLiteralPropertiesRemoval.mutationName as string)
  );
}
