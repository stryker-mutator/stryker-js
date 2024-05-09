import babel from '@babel/core';

const { types } = babel;

import { ArrowFunction } from '@stryker-mutator/api/core';

import { NodeMutator } from './index.js';

export const arrowFunctionMutator: NodeMutator<ArrowFunction> = {
  name: 'ArrowFunction',

  operators: {
    ArrowFunctionRemoval: { mutationOperator: 'ArrowFunctionRemoval' },
  },

  *mutate(path) {
    if (
      path.isArrowFunctionExpression() &&
      !types.isBlockStatement(path.node.body) &&
      !(types.isIdentifier(path.node.body) && path.node.body.name === 'undefined')
    ) {
      yield [types.arrowFunctionExpression([], types.identifier('undefined')), this.operators.ArrowFunctionRemoval.mutationOperator];
    }
  },
};
