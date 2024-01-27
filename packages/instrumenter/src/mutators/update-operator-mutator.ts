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
      mutationOperator: 'PostfixIncrementOperatorNegation',
    },
    PostfixDecrementOperatorNegation: {
      replacement: '++',
      mutationOperator: 'PostfixDecrementOperatorNegation',
    },
    PrefixIncrementOperatorNegation: {
      replacement: '--',
      mutationOperator: 'PrefixIncrementOperatorNegation',
    },
    PrefixDecrementOperatorNegation: {
      replacement: '++',
      mutationOperator: 'PrefixDecrementOperatorNegation',
    },
  },

  *mutate(path) {
    if (path.isUpdateExpression()) {
      let operator;
      if (path.node.operator === '++') {
        operator = path.node.prefix ? this.operators.PrefixIncrementOperatorNegation : this.operators.PostfixIncrementOperatorNegation;
      } else {
        operator = path.node.prefix ? this.operators.PrefixDecrementOperatorNegation : this.operators.PostfixDecrementOperatorNegation;
      }

      const { replacement, mutationOperator } = operator;
      yield [types.updateExpression(replacement as '--' | '++', deepCloneNode(path.node.argument), path.node.prefix), mutationOperator];
    }
  },
};
