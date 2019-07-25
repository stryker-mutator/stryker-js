import * as types from '@babel/types';
import { NodeMutator } from './NodeMutator';
import { NodeGenerator } from '../helpers/NodeGenerator';

/**
 * Represents a mutator which can remove the conditional clause from statements.
 */
export default class ForStatementMutator implements NodeMutator {
  public name = 'ForStatement';

  constructor() { }

  public mutate(node: types.Node, copy: <T extends types.Node>(obj: T, deep?: boolean) => T): types.Node[] {
    if (types.isForStatement(node)) {
      if (!node.test) {
        const mutatedNode = copy(node) as types.ForStatement;
        mutatedNode.test = NodeGenerator.createBooleanLiteralNode(node, false);
        return [mutatedNode];
      } else {
        return [NodeGenerator.createBooleanLiteralNode(node.test, false)];
      }
    }
    return [];
  }
}
