import { NodePath, types } from '@babel/core';

import { NodeMutation } from '../mutant';

import { NodeMutator } from './node-mutator';

export class ArrayDeclarationMutator implements NodeMutator {
  public name = 'ArrayDeclaration';

  public mutate(path: NodePath): NodeMutation[] {
    if (path.isArrayExpression()) {
      const replacement = path.node.elements.length ? types.arrayExpression() : types.arrayExpression([types.stringLiteral('Stryker was here')]);
      return [{ original: path.node, replacement }];
    }
    if ((path.isCallExpression() || path.isNewExpression()) && types.isIdentifier(path.node.callee) && path.node.callee.name === 'Array') {
      const mutatedCallArgs = path.node.arguments.length ? [] : [types.arrayExpression()];
      const replacement = types.isNewExpression(path)
        ? types.newExpression(path.node.callee, mutatedCallArgs)
        : types.callExpression(path.node.callee, mutatedCallArgs);
      return [{ original: path.node, replacement }];
    }

    return [];
  }
}
