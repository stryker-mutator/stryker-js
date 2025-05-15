import babel, { type NodePath } from '@babel/core';

import { deepCloneNode } from '../util/index.js';

import { NodeMutator } from './node-mutator.js';

const booleanOperators = Object.freeze([
  '!=',
  '!==',
  '&&',
  '<',
  '<=',
  '==',
  '===',
  '>',
  '>=',
  '||',
]);

const { types } = babel;

export const conditionalExpressionMutator: NodeMutator = {
  name: 'ConditionalExpression',

  *mutate(path) {
    if (isTestOfLoop(path)) {
      yield types.booleanLiteral(false);
    } else if (isTestOfCondition(path)) {
      yield types.booleanLiteral(true);
      yield types.booleanLiteral(false);
    } else if (isBooleanExpression(path)) {
      if (path.parent?.type === 'LogicalExpression') {
        // For (x || y), do not generate the (true || y) mutation as it
        // has the same behavior as the (true) mutator, handled in the
        // isTestOfCondition branch above
        if (path.parent.operator === '||') {
          yield types.booleanLiteral(false);
          return;
        }
        // For (x && y), do not generate the (false && y) mutation as it
        // has the same behavior as the (false) mutator, handled in the
        // isTestOfCondition branch above
        if (path.parent.operator === '&&') {
          yield types.booleanLiteral(true);
          return;
        }
      }
      yield types.booleanLiteral(true);
      yield types.booleanLiteral(false);
    } else if (path.isForStatement() && !path.node.test) {
      const replacement = deepCloneNode(path.node);
      replacement.test = types.booleanLiteral(false);
      yield replacement;
    } else if (path.isSwitchCase() && path.node.consequent.length > 0) {
      // if not a fallthrough case
      const replacement = deepCloneNode(path.node);
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
  return (
    (parentPath.isForStatement() ||
      parentPath.isWhileStatement() ||
      parentPath.isDoWhileStatement()) &&
    parentPath.node.test === path.node
  );
}

function isTestOfCondition(path: NodePath): boolean {
  const { parentPath } = path;
  if (!parentPath) {
    return false;
  }
  return (
    parentPath.isIfStatement() /*|| parentPath.isConditionalExpression()*/ &&
    parentPath.node.test === path.node
  );
}

function isBooleanExpression(path: NodePath) {
  return (
    (path.isBinaryExpression() || path.isLogicalExpression()) &&
    booleanOperators.includes(path.node.operator)
  );
}
