import * as types from '@babel/types';
import NodeMutator from './NodeMutator';

/**
 * Represents a mutator which can remove the content of an array's elements.
 */
export default class ArrayLiteralMutator implements NodeMutator {
  name = 'ArrayLiteral';

  mutate(node: types.Node, copy: <T extends types.Node>(obj: T, deep?: boolean) => T): void | types.Node[] {
    let nodes: types.Node[] = [];

    if (types.isArrayExpression(node) && node.elements.length > 0) {
      let mutatedNode = copy(node);
      mutatedNode.elements = [];
      nodes.push(mutatedNode);
    }

    return nodes;
  }
}