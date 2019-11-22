import * as types from '@babel/types';

import { NodeGenerator } from '../helpers/NodeGenerator';

import { NodeMutator } from './NodeMutator';

/**
 * Represents a mutator which can remove the conditional clause from statements.
 */
export default class IfStatementMutator implements NodeMutator {
  public name = 'IfStatement';

  public mutate(node: types.Node): types.Node[] {
    if (types.isIfStatement(node)) {
      return [NodeGenerator.createBooleanLiteralNode(node.test, false), NodeGenerator.createBooleanLiteralNode(node.test, true)];
    }

    return [];
  }
}
