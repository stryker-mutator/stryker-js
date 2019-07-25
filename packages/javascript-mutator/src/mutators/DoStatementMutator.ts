import * as types from '@babel/types';
import { NodeMutator } from './NodeMutator';
import { NodeGenerator } from '../helpers/NodeGenerator';

/**
 * Represents a mutator which can remove the conditional clause from statements.
 */
export default class DoStatementMutator implements NodeMutator {
  public name = 'DoStatement';

  constructor() { }

  public mutate(node: types.Node): types.Node[] {
    if (types.isDoWhileStatement(node)) {
      return [NodeGenerator.createBooleanLiteralNode(node.test, false)];
    }
    return [];
  }
}
