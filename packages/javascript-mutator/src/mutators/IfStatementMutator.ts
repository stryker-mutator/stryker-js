import * as types from '@babel/types';
import { NodeMutator } from './NodeMutator';
import { NodeGenerator } from '../helpers/NodeGenerator';

/**
 * Represents a mutator which can remove the conditional clause from statements.
 */
export default class IfStatementMutator implements NodeMutator {
  public name = 'IfStatement';

  constructor() { }

  public mutate(node: types.Node): types.Node[] {
    if (types.isIfStatement(node)) {
      return [
        NodeGenerator.createBooleanLiteralNode(node.test, false),
        NodeGenerator.createBooleanLiteralNode(node.test, true)
      ];
    }
    return [];
  }
}
