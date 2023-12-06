import babel from '@babel/core';

import { deepCloneNode } from '../util/index.js';

import { NodeMutatorConfiguration } from '../mutation-level/mutation-level.js';

import { NodeMutator } from './index.js';

const { types } = babel;

const operators: NodeMutatorConfiguration = {
  'Post++To--': { replacement: '--', mutationName: 'Post++To--' },
  'Post--To++': { replacement: '++', mutationName: 'Post--To++' },
  'Pre++To--': { replacement: '--', mutationName: 'Pre++To--' },
  'Pre--To++': { replacement: '++', mutationName: 'Pre--To++' },
  '++': { replacement: '--', mutationName: '++all' },
  '--': { replacement: '++', mutationName: '--all' },
};

export const updateOperatorMutator: NodeMutator = {
  name: 'UpdateOperator',

  *mutate(path, levelMutations) {
    if (path.isUpdateExpression()) {
      if (levelMutations === undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        yield types.updateExpression(operators[path.node.operator].replacement, deepCloneNode(path.node.argument), path.node.prefix);
      } else {
        let replacement = undefined;
        if (path.node.prefix && path.node.operator == '++') {
          replacement = getReplacement(levelMutations, operators['Pre++To--'].mutationName);
        } else if (path.node.prefix && path.node.operator == '--') {
          replacement = getReplacement(levelMutations, operators['Pre--To++'].mutationName);
        } else if (!path.node.prefix && path.node.operator == '++') {
          replacement = getReplacement(levelMutations, operators['Post++To--'].mutationName);
        } else if (!path.node.prefix && path.node.operator == '--') {
          replacement = getReplacement(levelMutations, operators['Post--To++'].mutationName);
        }
        if (replacement !== undefined) {
          yield types.updateExpression(replacement, deepCloneNode(path.node.argument), path.node.prefix);
        }
      }
    }
  },
};

function getReplacement(levelMutations: string[], mutationName: string): '--' | '++' | undefined {
  if (levelMutations.includes(mutationName)) {
    const { replacement } = operators[mutationName];
    return replacement;
  }
  return undefined;
}
