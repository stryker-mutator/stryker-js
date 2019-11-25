import * as types from '@babel/types';

import { NodeGenerator } from '../helpers/NodeGenerator';

import { NodeMutator } from './NodeMutator';

/**
 * Represents a mutator which can remove the content of a Object.
 */
export default class ObjectLiteralMutator implements NodeMutator {
  public name = 'ObjectLiteral';

  public mutate(node: types.Node, copy: <T extends types.Node>(obj: T, deep?: boolean) => T): types.Node[] {
    const nodes: types.Node[] = [];

    if (types.isObjectExpression(node) && node.properties.length > 0) {
      const mutatedNode = copy(node);
      mutatedNode.properties = [];
      nodes.push(mutatedNode);
    }

    if (types.isObjectExpression(node)) {
      nodes.push(NodeGenerator.createIdentifierNode(node, 'null'));
    }

    return nodes;
  }
}
