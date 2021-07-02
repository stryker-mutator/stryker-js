import { NodePath, types } from '@babel/core';

import { NodeMutator } from './node-mutator';

const booleanOperators = Object.freeze(['!=', '!==', '&&', '<', '<=', '==', '===', '>', '>=', '||']);

export const conditionalExpressionMutator: NodeMutator = {
  name: 'ConditionalExpression',

  *mutate(path) {
    if (isTestOfLoop(path)) {
      yield types.booleanLiteral(false);
    } else if (isTestOfCondition(path)) {
      yield types.booleanLiteral(true);
      yield types.booleanLiteral(false);
    } else if (isBooleanExpression(path)) {
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
  },
};

function isTestOfLoop(path: NodePath): boolean {
  const { parentPath } = path;
  if (!parentPath) {
    return false;
  }
  return (parentPath.isForStatement() || parentPath.isWhileStatement() || parentPath.isDoWhileStatement()) && parentPath.node.test === path.node;
}

function isTestOfCondition(path: NodePath): boolean {
  const { parentPath } = path;
  if (!parentPath) {
    return false;
  }
  return parentPath.isIfStatement() /*|| parentPath.isConditionalExpression()*/ && parentPath.node.test === path.node;
}

function isBooleanExpression(path: NodePath<types.Node>) {
  return (path.isBinaryExpression() || path.isLogicalExpression()) && booleanOperators.includes(path.node.operator);
}
