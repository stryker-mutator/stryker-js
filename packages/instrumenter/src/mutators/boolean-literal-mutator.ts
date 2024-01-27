import babel from '@babel/core';

import { BooleanLiteral } from '@stryker-mutator/api/core';

import { deepCloneNode } from '../util/index.js';

const { types } = babel;

import { NodeMutator } from './index.js';

export const booleanLiteralMutator: NodeMutator<BooleanLiteral> = {
  name: 'BooleanLiteral',

  operators: {
    true: { replacement: false, mutationOperator: 'TrueLiteralNegation' },
    false: { replacement: true, mutationOperator: 'FalseLiteralNegation' },
    '!': { replacement: '', mutationOperator: 'LogicalNotRemoval' },
  },

  *mutate(path) {
    if (path.isBooleanLiteral()) {
      const { replacement, mutationOperator } = path.node.value ? this.operators.true : this.operators.false;

      yield [types.booleanLiteral(replacement as boolean), mutationOperator];
    }
    if (path.isUnaryExpression() && path.node.operator === '!' && path.node.prefix) {
      yield [deepCloneNode(path.node.argument), this.operators['!'].mutationOperator];
    }
  },
};
