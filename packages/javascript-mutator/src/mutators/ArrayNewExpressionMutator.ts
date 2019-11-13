import * as types from '@babel/types';

import { NodeMutator } from './NodeMutator';

/**
 * Represents a mutator which can remove the content of an array's elements.
 */
export default class ArrayNewExpressionMutator implements NodeMutator {
  public name = 'ArrayNewExpression';

  public mutate(node: types.Node, copy: <T extends types.Node>(obj: T, deep?: boolean) => T): types.Node[] {
    const nodes: types.Node[] = [];

    if (
      (types.isCallExpression(node) || types.isNewExpression(node)) &&
      types.isIdentifier(node.callee) &&
      node.callee.name === 'Array' &&
      node.arguments.length > 0
    ) {
      const mutatedNode = copy(node);
      mutatedNode.arguments = [];
      nodes.push(mutatedNode);
    }

    return nodes;
  }
}
