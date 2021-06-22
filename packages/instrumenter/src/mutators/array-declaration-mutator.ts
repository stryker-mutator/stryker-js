import { NodePath, types } from '@babel/core';

import { NodeMutator } from './node-mutator';

export class ArrayDeclarationMutator implements NodeMutator {
  public name = 'ArrayDeclaration';

  public *mutate(path: NodePath): Iterable<types.Node> {
    if (path.isArrayExpression()) {
      const replacement = path.node.elements.length ? types.arrayExpression() : types.arrayExpression([types.stringLiteral('Stryker was here')]);
      yield replacement;
    }
    if ((path.isCallExpression() || path.isNewExpression()) && types.isIdentifier(path.node.callee) && path.node.callee.name === 'Array') {
      const mutatedCallArgs = path.node.arguments.length ? [] : [types.arrayExpression()];
      const replacement = types.isNewExpression(path)
        ? types.newExpression(path.node.callee, mutatedCallArgs)
        : types.callExpression(path.node.callee, mutatedCallArgs);
      yield replacement;
    }
  }
}
