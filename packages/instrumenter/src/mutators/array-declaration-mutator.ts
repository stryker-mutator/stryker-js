import babel from '@babel/core';

import { ArrayDeclaration } from '@stryker-mutator/api/core';

import { deepCloneNode } from '../util/index.js';

import { NodeMutator } from './node-mutator.js';

const { types } = babel;

export const arrayDeclarationMutator: NodeMutator<ArrayDeclaration> = {
  name: 'ArrayDeclaration',

  operators: {
    ArrayLiteralItemsFill: {
      replacement: types.arrayExpression([types.stringLiteral('Stryker was here')]),
      mutationName: 'ArrayLiteralItemsFill',
    },
    ArrayConstructorItemsFill: { replacement: [types.stringLiteral('Stryker was here')], mutationName: 'ArrayConstructorItemsFill' },
    ArrayLiteralItemsRemoval: { replacement: types.arrayExpression(), mutationName: 'ArrayLiteralItemsRemoval' },
    ArrayConstructorItemsRemoval: { replacement: [], mutationName: 'ArrayConstructorItemsRemoval' },
  },

  *mutate(path, levelMutations) {
    // The check of the [] construct in code
    if (path.isArrayExpression() && isArrayInLevel(path.node, levelMutations)) {
      const replacement =
        path.node.elements.length > 0 ? this.operators.ArrayLiteralItemsRemoval.replacement : this.operators.ArrayLiteralItemsFill.replacement;
      yield replacement;
    }
    // Check for the new Array() construct in code
    if (
      (path.isCallExpression() || path.isNewExpression()) &&
      types.isIdentifier(path.node.callee) &&
      path.node.callee.name === 'Array' &&
      isArrayConstructorInLevel(path.node, levelMutations)
    ) {
      const mutatedCallArgs: babel.types.Expression[] =
        path.node.arguments.length > 0
          ? this.operators.ArrayConstructorItemsRemoval.replacement
          : this.operators.ArrayConstructorItemsFill.replacement;

      const replacement = types.isNewExpression(path.node)
        ? types.newExpression(deepCloneNode(path.node.callee), mutatedCallArgs)
        : types.callExpression(deepCloneNode(path.node.callee), mutatedCallArgs);
      yield replacement;
    }
  },

  numberOfMutants(path): number {
    if (
      path.isArrayExpression() ||
      ((path.isCallExpression() || path.isNewExpression()) && types.isIdentifier(path.node.callee) && path.node.callee.name === 'Array')
    ) {
      return 1;
    }

    return 0;
  },
};

function isArrayInLevel(node: babel.types.ArrayExpression, levelMutations: string[] | undefined): boolean {
  // No mutation level specified, so allow everything
  if (levelMutations === undefined) {
    return true;
  }

  return (
    (levelMutations.includes(arrayDeclarationMutator.operators.ArrayLiteralItemsRemoval.mutationName) && node.elements.length > 0) ||
    (levelMutations.includes(arrayDeclarationMutator.operators.ArrayLiteralItemsFill.mutationName) && node.elements.length === 0)
  );
}

function isArrayConstructorInLevel(node: babel.types.CallExpression | babel.types.NewExpression, levelMutations: string[] | undefined): boolean {
  // No mutation level specified, so allow everything
  if (levelMutations === undefined) {
    return true;
  }

  return (
    (levelMutations.includes(arrayDeclarationMutator.operators.ArrayConstructorItemsRemoval.mutationName) && node.arguments.length > 0) ||
    (levelMutations.includes(arrayDeclarationMutator.operators.ArrayConstructorItemsFill.mutationName) && node.arguments.length === 0)
  );
}
