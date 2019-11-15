import * as types from '@babel/types';

import { NodeGenerator } from '../helpers/NodeGenerator';

import { NodeMutator } from './NodeMutator';

/**
 * Represents a mutator which can remove the conditional clause from statements.
 */
export default class ForStatementMutator implements NodeMutator {
  public name = 'ForStatement';

  public mutate(node: types.Node, copy: <T extends types.Node>(obj: T, deep?: boolean) => T): types.Node[] {
    const nodes: types.Node[] = [];
    if (types.isForStatement(node)) {
      if (!node.test) {
        const mutatedNode = copy(node);
        mutatedNode.test = NodeGenerator.createBooleanLiteralNode(node, false);
        nodes.push(mutatedNode);
      } else {
        nodes.push(NodeGenerator.createBooleanLiteralNode(node.test, false));
      }
    }

    return nodes;
  }
}
