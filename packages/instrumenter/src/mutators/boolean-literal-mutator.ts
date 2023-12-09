import babel from '@babel/core';

import { BooleanLiteral } from '@stryker-mutator/api/core';

import { deepCloneNode } from '../util/index.js';

const { types } = babel;

import { NodeMutator } from './index.js';

export const booleanLiteralMutator: NodeMutator<BooleanLiteral> = {
  name: 'BooleanLiteral',

  operators: {
    true: { replacement: false, mutationName: 'TrueLiteralNegation' },
    false: { replacement: true, mutationName: 'FalseLiteralNegation' },
    '!': { replacement: '', mutationName: 'LogicalNotRemoval' },
  },

  *mutate(path, levelMutations) {
    if (isInMutationLevel(path, levelMutations)) {
      if (path.isBooleanLiteral()) {
        yield types.booleanLiteral(!path.node.value);
      }
      if (path.isUnaryExpression() && path.node.operator === '!' && path.node.prefix) {
        yield deepCloneNode(path.node.argument);
      }
    }
  },
};

function isInMutationLevel(path: any, levelMutations: string[] | undefined): boolean {
  if (levelMutations === undefined) {
    return true;
  }
  if (path.isBooleanLiteral()) {
    const { mutationName: mutatorName } = booleanLiteralMutator.operators[path.node.value];
    return levelMutations.some((lit) => lit === mutatorName);
  }
  return (
    path.isUnaryExpression() &&
    path.node.operator === '!' &&
    path.node.prefix &&
    levelMutations.some((lit: string) => lit === booleanLiteralMutator.operators['!'].mutationName)
  );
}
