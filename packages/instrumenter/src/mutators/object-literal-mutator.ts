import babel from '@babel/core';

import { ObjectLiteral } from '@stryker-mutator/api/core';

import { NodeMutator } from './index.js';

const { types } = babel;

export const objectLiteralMutator: NodeMutator<ObjectLiteral> = {
  name: 'ObjectLiteral',

  operators: {
    ObjectLiteralPropertiesRemoval: { mutationOperator: 'ObjectLiteralPropertiesRemoval' },
  },

  *mutate(path) {
    if (path.isObjectExpression() && path.node.properties.length > 0) {
      yield [types.objectExpression([]), this.operators.ObjectLiteralPropertiesRemoval.mutationOperator];
    }
  },
};
