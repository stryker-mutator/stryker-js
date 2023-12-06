import babel from '@babel/core';

import { deepCloneNode } from '../util/index.js';
import { NodeMutatorConfiguration } from '../mutation-level/mutation-level.js';

import { NodeMutator } from './node-mutator.js';

const { types } = babel;

const operators: NodeMutatorConfiguration = {
  EmptyArray: { replacement: types.arrayExpression([types.stringLiteral('Stryker was here')]), mutationName: 'EmptyArray' },
  EmptyArrayConstructor: { replacement: [types.stringLiteral('Stryker was here')], mutationName: 'EmptyArrayConstructor' },
  FilledArray: { replacement: types.arrayExpression(), mutationName: 'FilledArray' },
  FilledArrayConstructor: { replacement: [], mutationName: 'FilledArrayConstructor' },
};

export const arrayDeclarationMutator: NodeMutator = {
  name: 'ArrayDeclaration',

  *mutate(path, levelMutations) {
    // The check of the [] construct in code
    if (path.isArrayExpression() && isArrayInLevel(path.node, levelMutations)) {
      const replacement = path.node.elements.length > 0 ? operators.FilledArray.replacement : operators.EmptyArray.replacement;
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
        path.node.arguments.length > 0 ? operators.FilledArrayConstructor.replacement : operators.EmptyArrayConstructor.replacement;

      const replacement = types.isNewExpression(path.node)
        ? types.newExpression(deepCloneNode(path.node.callee), mutatedCallArgs)
        : types.callExpression(deepCloneNode(path.node.callee), mutatedCallArgs);
      yield replacement;
    }
  },
};

function isArrayInLevel(node: babel.types.ArrayExpression, levelMutations: string[] | undefined): boolean {
  // No mutation level specified, so allow everything
  if (levelMutations === undefined) {
    return true;
  }

  return (
    (levelMutations.includes(operators.FilledArray.mutationName) && node.elements.length > 0) ||
    (levelMutations.includes(operators.EmptyArray.mutationName) && node.elements.length === 0)
  );
}

function isArrayConstructorInLevel(node: babel.types.CallExpression | babel.types.NewExpression, levelMutations: string[] | undefined): boolean {
  // No mutation level specified, so allow everything
  if (levelMutations === undefined) {
    return true;
  }

  return (
    (levelMutations.includes(operators.FilledArrayConstructor.mutationName) && node.arguments.length > 0) ||
    (levelMutations.includes(operators.EmptyArrayConstructor.mutationName) && node.arguments.length === 0)
  );
}
