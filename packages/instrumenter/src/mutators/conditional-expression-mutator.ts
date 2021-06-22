import { NodePath, types } from '@babel/core';

import { NodeMutator } from './node-mutator';

export class ConditionalExpressionMutator implements NodeMutator {
  private readonly validOperators: string[] = ['!=', '!==', '&&', '<', '<=', '==', '===', '>', '>=', '||'];

  public name = 'ConditionalExpression';

  private isTestOfALoop(path: NodePath): boolean {
    const { parentPath } = path;
    return (
      Boolean(parentPath) &&
      (parentPath.isForStatement() || parentPath.isWhileStatement() || parentPath.isDoWhileStatement()) &&
      parentPath.node.test === path.node
    );
  }

  private isTestOfNonLoop(path: NodePath): boolean {
    const { parentPath } = path;
    return Boolean(parentPath) && (parentPath.isIfStatement() || parentPath.isConditionalExpression()) && parentPath.node.test === path.node;
  }

  private isValidOperator(operator: string): boolean {
    return this.validOperators.includes(operator);
  }

  public *mutate(path: NodePath): Iterable<types.Node> {
    if (this.isTestOfALoop(path)) {
      yield types.booleanLiteral(false);
    } else if (this.isTestOfNonLoop(path)) {
      yield types.booleanLiteral(true);
      yield types.booleanLiteral(false);
    } else if ((path.isBinaryExpression() || path.isLogicalExpression()) && this.isValidOperator(path.node.operator)) {
      yield types.booleanLiteral(true);
      yield types.booleanLiteral(false);
    } else if (path.isForStatement() && !path.node.test) {
      const replacement = types.cloneNode(path.node, /* deep */ true);
      replacement.test = types.booleanLiteral(false);
      yield replacement;
    } else if (path.isSwitchCase() && path.node.consequent.length > 0) {
      // if not a fallthrough case
      const replacement = types.cloneNode(path.node);
      replacement.consequent = [];
      yield replacement;
    }
  }
}
