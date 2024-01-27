import babel, { Node } from '@babel/core';

import { ArrayDeclaration } from '@stryker-mutator/api/core';

import { deepCloneNode } from '../util/index.js';

import { NodeMutator } from './node-mutator.js';

const { types } = babel;

export const arrayDeclarationMutator: NodeMutator<ArrayDeclaration> = {
  name: 'ArrayDeclaration',

  operators: {
    ArrayLiteralItemsFill: {
      replacement: types.arrayExpression([types.stringLiteral('Stryker was here')]),
      mutationOperator: 'ArrayLiteralItemsFill',
    },
    ArrayConstructorItemsFill: { replacement: [types.stringLiteral('Stryker was here')], mutationOperator: 'ArrayConstructorItemsFill' },
    ArrayLiteralItemsRemoval: { replacement: types.arrayExpression(), mutationOperator: 'ArrayLiteralItemsRemoval' },
    ArrayConstructorItemsRemoval: { replacement: [], mutationOperator: 'ArrayConstructorItemsRemoval' },
  },

  *mutate(path) {
    // The check of the [] construct in code
    if (path.isArrayExpression()) {
      const { replacement, mutationOperator } =
        path.node.elements.length > 0 ? this.operators.ArrayLiteralItemsRemoval : this.operators.ArrayLiteralItemsFill;
      yield [replacement as Node, mutationOperator];
    }
    // Check for the new Array() construct in code
    if ((path.isCallExpression() || path.isNewExpression()) && types.isIdentifier(path.node.callee) && path.node.callee.name === 'Array') {
      const { replacement, mutationOperator } =
        path.node.arguments.length > 0 ? this.operators.ArrayConstructorItemsRemoval : this.operators.ArrayConstructorItemsFill;

      const nodeClone = types.isNewExpression(path.node)
        ? types.newExpression(deepCloneNode(path.node.callee), replacement as babel.types.Expression[])
        : types.callExpression(deepCloneNode(path.node.callee), replacement as babel.types.Expression[]);

      yield [nodeClone, mutationOperator];
    }
  },
};
