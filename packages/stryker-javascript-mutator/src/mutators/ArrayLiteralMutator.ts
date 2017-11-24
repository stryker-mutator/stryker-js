import { types } from 'babel-core';
import NodeMutator from './NodeMutator';

/**
 * Represents a mutator which can remove the content of an array's elements.
 */
export default class ArrayLiteralMutator implements NodeMutator {
  name = 'ArrayLiteral';

  mutate(node: types.Node, copy: <T extends types.Node>(obj: T, deep?: boolean) => T): void | types.Node[] {
    let nodes: types.Node[] = [];

    if ((types.isCallExpression(node) || types.isNewExpression(node)) && types.isIdentifier(node.callee) && node.callee.name === 'Array' && node.arguments.length > 0) {
      let mutatedNode = copy(node);
      mutatedNode.arguments = [];
      nodes.push(mutatedNode);
    }

    return nodes;
  }
}