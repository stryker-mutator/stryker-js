import babel from '@babel/core';

import { UpdateOperator } from '@stryker-mutator/api/core';

import { deepCloneNode } from '../util/index.js';

import { NodeMutator } from './index.js';

const { types } = babel;

export const updateOperatorMutator: NodeMutator<UpdateOperator> = {
  name: 'UpdateOperator',

  operators: {
    PostfixIncrementOperatorNegation: {
      replacement: '--',
      mutationName: 'PostfixIncrementOperatorNegation',
    },
    PostfixDecrementOperatorNegation: {
      replacement: '++',
      mutationName: 'PostfixDecrementOperatorNegation',
    },
    PrefixIncrementOperatorNegation: {
      replacement: '--',
      mutationName: 'PrefixIncrementOperatorNegation',
    },
    PrefixDecrementOperatorNegation: {
      replacement: '++',
      mutationName: 'PrefixDecrementOperatorNegation',
    },
  },

  *mutate(path, levelMutations) {
    if (path.isUpdateExpression()) {
      if (levelMutations === undefined) {
        const replacement = path.node.operator === '++' ? '--' : '++';
        yield types.updateExpression(replacement, deepCloneNode(path.node.argument), path.node.prefix);
      } else {
        let replacement = undefined;
        if (path.node.prefix && path.node.operator == '++') {
          replacement = getReplacement(levelMutations, this.operators.PrefixIncrementOperatorNegation.mutationName);
        } else if (path.node.prefix && path.node.operator == '--') {
          replacement = getReplacement(levelMutations, this.operators.PrefixDecrementOperatorNegation.mutationName);
        } else if (!path.node.prefix && path.node.operator == '++') {
          replacement = getReplacement(levelMutations, this.operators.PostfixIncrementOperatorNegation.mutationName);
        } else if (!path.node.prefix && path.node.operator == '--') {
          replacement = getReplacement(levelMutations, this.operators.PostfixDecrementOperatorNegation.mutationName);
        }
        if (replacement !== undefined) {
          yield types.updateExpression(replacement, deepCloneNode(path.node.argument), path.node.prefix);
        }
      }
    }
  },

  numberOfMutants(path): number {
    return path.isUpdateExpression() ? 1 : 0;
  },
};

function getReplacement(levelMutations: string[], mutationName: string): '--' | '++' | undefined {
  if (levelMutations.includes(mutationName)) {
    const { replacement } = updateOperatorMutator.operators[mutationName];
    return replacement;
  }
  return undefined;
}
