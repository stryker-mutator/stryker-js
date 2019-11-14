import * as types from '@babel/types';

import { NodeMutator } from './NodeMutator';

/**
 * Represents a mutator which can remove the content of an array's elements.
 */
export default class ArrayDeclarationMutator implements NodeMutator {
  public name = 'ArrayDeclaration';

  public mutate(node: types.Node, copy: <T extends types.Node>(obj: T, deep?: boolean) => T): types.Node[] {
    const nodes: types.Node[] = [];

    if (types.isArrayExpression(node)) {
      const mutatedNode = copy(node);
      mutatedNode.elements = node.elements.length ? [] : [types.stringLiteral('Stryker was here')];
      nodes.push(mutatedNode);
    } else if ((types.isCallExpression(node) || types.isNewExpression(node)) && types.isIdentifier(node.callee) && node.callee.name === 'Array') {
      const mutatedNode = copy(node);
      mutatedNode.arguments = node.arguments.length ? [] : [types.arrayExpression()];
      nodes.push(mutatedNode);
    }

    return nodes;
  }
}
