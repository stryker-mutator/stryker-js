import * as types from '@babel/types';

import { NodeGenerator } from '../helpers/NodeGenerator';
import { NodeWithParent } from '../helpers/ParentNode';

import { NodeMutator } from './NodeMutator';

/**
 * Represents a mutator which can remove the conditional clause from statements.
 */
export default class ConditionalExpressionMutator implements NodeMutator {
  private readonly validOperators: string[] = ['!=', '!==', '&&', '<', '<=', '==', '===', '>', '>=', '||'];

  public name = 'ConditionalExpression';

  private hasValidParent(node: NodeWithParent): boolean {
    return (
      !node.parent ||
      !(
        types.isForStatement(node.parent) ||
        types.isWhileStatement(node.parent) ||
        types.isIfStatement(node.parent) ||
        types.isDoWhileStatement(node.parent)
      )
    );
  }

  private isValidOperator(operator: string): boolean {
    return this.validOperators.includes(operator);
  }

  public mutate(node: types.Node): Array<[types.Node, types.Node | { raw: string }]> {
    if ((types.isBinaryExpression(node) || types.isLogicalExpression(node)) && this.hasValidParent(node) && this.isValidOperator(node.operator)) {
      return [
        // raw string mutations
        [node, { raw: 'true' }],
        [node, { raw: 'false' }]
      ];
    } else if (types.isDoWhileStatement(node) || types.isWhileStatement(node)) {
      return [[node.test, { raw: 'false' }]];
    } else if (types.isForStatement(node)) {
      if (!node.test) {
        return [[node, NodeGenerator.createMutatedCloneWithProperties(node, { test: types.booleanLiteral(false) })]];
      } else {
        return [[node.test, { raw: 'false' }]];
      }
    } else if (types.isIfStatement(node)) {
      return [
        // raw string mutations in the `if` condition
        [node.test, { raw: 'true' }],
        [node.test, { raw: 'false' }]
      ];
    } else if (
      types.isSwitchCase(node) &&
      // if not a fallthrough case
      node.consequent.length > 0
    ) {
      return [[node, NodeGenerator.createMutatedCloneWithProperties(node, { consequent: [] })]];
    }

    return [];
  }
}
