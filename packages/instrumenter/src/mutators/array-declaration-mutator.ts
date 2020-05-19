import { NodePath, types } from '@babel/core';

import { NodeMutation } from '../mutant';

import { NodeMutator } from './node-mutator';

export class ArrayDeclarationMutator implements NodeMutator {
  public name = 'ArrayDeclaration';

  public mutate(path: NodePath): NodeMutation[] {
    if (types.isArrayExpression(path)) {
      const replacement = path.elements.length ? types.arrayExpression() : types.arrayExpression([types.stringLiteral('Stryker was here')]);
      return [{ original: path.node, replacement }];
    } else if ((types.isCallExpression(path) || types.isNewExpression(path)) && types.isIdentifier(path.callee) && path.callee.name === 'Array') {
      const mutatedCallArgs = path.arguments && path.arguments.length ? [] : [types.arrayExpression()];
      const replacement = types.isNewExpression(path)
        ? types.newExpression(path.callee, mutatedCallArgs)
        : types.callExpression(path.callee, mutatedCallArgs);
      return [{ original: path.node, replacement }];
    } else {
      return [];
    }
  }
}
