import { NodePath, types } from '@babel/core';

import { NodeMutation } from '../mutant';

import { NodeMutator } from './node-mutator';

export class ArrayDeclarationMutator implements NodeMutator {
  public name = 'ArrayDeclaration';

  public mutate(path: NodePath): NodeMutation[] {
    const currentNode = path.node;

    if (types.isArrayExpression(currentNode)) {
      const replacement = currentNode.elements.length ? types.arrayExpression() : types.arrayExpression([types.stringLiteral('Stryker was here')]);
      return [{ original: currentNode, replacement }];
    } else if (
      (types.isCallExpression(currentNode) || types.isNewExpression(currentNode)) &&
      types.isIdentifier(currentNode.callee) &&
      currentNode.callee.name === 'Array'
    ) {
      const mutatedCallArgs = currentNode.arguments && currentNode.arguments.length ? [] : [types.arrayExpression()];
      const replacement = types.isNewExpression(path)
        ? types.newExpression(currentNode.callee, mutatedCallArgs)
        : types.callExpression(currentNode.callee, mutatedCallArgs);
      return [{ original: currentNode, replacement }];
    } else {
      return [];
    }
  }
}
