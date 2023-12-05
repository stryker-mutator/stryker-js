import babel from '@babel/core';

import { deepCloneNode } from '../util/index.js';

import { NodeMutator } from './index.js';

const { types } = babel;

const operators = Object.assign({
  'Post++To--': { replacementOperator: '--', mutatorName: 'Post++To--' },
  'Post--To++': { replacementOperator: '++', mutatorName: 'Post--To++' },
  'Pre++To--': { replacementOperator: '--', mutatorName: 'Pre++To--' },
  'Pre--To++': { replacementOperator: '++', mutatorName: 'Pre--To++' },
  '++': { replacementOperator: '--', mutatorName: '++all' },
  '--': { replacementOperator: '++', mutatorName: '--all' },
} as const);

export const updateOperatorMutator: NodeMutator = {
  name: 'UpdateOperator',

  *mutate(path, operations) {
    if (path.isUpdateExpression()) {
      if (operations === undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        yield types.updateExpression(operators[path.node.operator].replacementOperator, deepCloneNode(path.node.argument), path.node.prefix);
      } else {
        let replacement = undefined;
        if (path.node.prefix && path.node.operator == '++' && operations.includes(operators['Pre++To--'].mutatorName as string)) {
          replacement = operators['Pre++To--'].replacementOperator;
        } else if (path.node.prefix && path.node.operator == '--' && operations.includes(operators['Pre--To++'].mutatorName as string)) {
          replacement = operators['Pre--To++'].replacementOperator;
        } else if (!path.node.prefix && path.node.operator == '++' && operations.includes(operators['Post++To--'].mutatorName as string)) {
          replacement = operators['Post++To--'].replacementOperator;
        } else if (!path.node.prefix && path.node.operator == '--' && operations.includes(operators['Post--To++'].mutatorName as string)) {
          replacement = operators['Post--To++'].replacementOperator;
        }
        if (replacement !== undefined) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          yield types.updateExpression(replacement, deepCloneNode(path.node.argument), path.node.prefix);
        }
      }
    }
  },
};
