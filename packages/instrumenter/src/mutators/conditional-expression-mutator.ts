import { NodePath, types } from '@babel/core';

import { NodeMutation } from '../mutant';

import { NodeMutator } from './node-mutator';

export class ConditionalExpressionMutator implements NodeMutator {
  private readonly validOperators: string[] = ['!=', '!==', '&&', '<', '<=', '==', '===', '>', '>=', '||'];

  public name = 'ConditionalExpression';

  private hasValidParent(node: NodePath): boolean {
    return !(
      types.isForStatement(node.parent) ||
      types.isWhileStatement(node.parent) ||
      types.isIfStatement(node.parent) ||
      types.isDoWhileStatement(node.parent)
    );
  }

  private isValidOperator(operator: string): boolean {
    return this.validOperators.includes(operator);
  }

  public mutate(path: NodePath): NodeMutation[] {
    if ((path.isBinaryExpression() || path.isLogicalExpression()) && this.hasValidParent(path) && this.isValidOperator(path.node.operator)) {
      return [
        { original: path.node, replacement: types.booleanLiteral(true) },
        { original: path.node, replacement: types.booleanLiteral(false) },
      ];
    }
    if (path.isDoWhileStatement() || path.isWhileStatement()) {
      return [{ original: path.node.test, replacement: types.booleanLiteral(false) }];
    }
    if (path.isForStatement()) {
      if (!path.node.test) {
        const replacement = types.cloneNode(path.node, /* deep */ false);
        replacement.test = types.booleanLiteral(false);
        return [{ original: path.node, replacement }];
      }

      return [{ original: path.node.test, replacement: types.booleanLiteral(false) }];
    }
    if (path.isIfStatement()) {
      return [
        // raw string mutations in the `if` condition
        { original: path.node.test, replacement: types.booleanLiteral(true) },
        { original: path.node.test, replacement: types.booleanLiteral(false) },
      ];
    }
    if (
      path.isSwitchCase() &&
      // if not a fallthrough case
      path.node.consequent.length > 0
    ) {
      const replacement = types.cloneNode(path.node);
      replacement.consequent = [];
      return [{ original: path.node, replacement }];
    }

    return [];
  }
}
