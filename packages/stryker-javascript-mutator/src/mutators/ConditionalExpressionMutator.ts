import * as types from '@babel/types';
import NodeMutator from './NodeMutator';
import NodeGenerator from '../helpers/NodeGenerator';

/**
 * Represents a mutator which can remove the conditional clause from statements.
 */
export default class ConditionalExpressionMutator implements NodeMutator {
  public name = 'ConditionalExpression';

  constructor() { }

  public mutate(node: types.Node): types.Node[] | void {
    if (types.isConditionalExpression(node)) {
        return [
          NodeGenerator.createBooleanLiteralNode(node.test, false),
          NodeGenerator.createBooleanLiteralNode(node.test, true)
        ];
    }
  }
}
