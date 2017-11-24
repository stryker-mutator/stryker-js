import { types } from 'babel-core';
import NodeMutator from './NodeMutator';
import NodeGenerator from '../helpers/NodeGenerator';

/**
 * Represents a mutator which can remove the conditional clause from statements.
 */
export default class IfStatementMutator implements NodeMutator {
  name = 'IfStatement';

  constructor() { }

  mutate(node: types.Node, copy: <T extends types.Node>(obj: T, deep?: boolean) => T): types.Node[] | void {
    if (types.isIfStatement(node)) {
      return [
        NodeGenerator.createBooleanLiteralNode(node.test, false),
        NodeGenerator.createBooleanLiteralNode(node.test, true)
      ];
    }
  }
}