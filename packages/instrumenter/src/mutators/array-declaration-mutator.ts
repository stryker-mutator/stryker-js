import babel, { type NodePath } from '@babel/core';

import { deepCloneNode } from '../util/index.js';

import { NodeMutator } from './node-mutator.js';

const { types } = babel;

export const arrayDeclarationMutator: NodeMutator = {
  name: 'ArrayDeclaration',

  *mutate(path: NodePath): Iterable<babel.types.Node> {
    if (path.isArrayExpression()) {
      const replacement = path.node.elements.length
        ? types.arrayExpression()
        : types.arrayExpression([types.stringLiteral('Stryker was here')]);
      yield replacement;
    }
    if (
      (path.isCallExpression() || path.isNewExpression()) &&
      types.isIdentifier(path.node.callee) &&
      path.node.callee.name === 'Array'
    ) {
      const mutatedCallArgs = path.node.arguments.length
        ? []
        : [types.arrayExpression()];
      const replacement = types.isNewExpression(path.node)
        ? types.newExpression(deepCloneNode(path.node.callee), mutatedCallArgs)
        : types.callExpression(
            deepCloneNode(path.node.callee),
            mutatedCallArgs,
          );
      yield replacement;
    }
  },
};
