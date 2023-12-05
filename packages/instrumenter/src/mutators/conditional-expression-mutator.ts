import babel, { type NodePath } from '@babel/core';

import { deepCloneNode } from '../util/index.js';

import { NodeMutator } from './node-mutator.js';

const booleanOperators = Object.freeze(['!=', '!==', '&&', '<', '<=', '==', '===', '>', '>=', '||']);

const { types } = babel;

const conditionalReplacements = Object.assign({
  BooleanExpressionToFalse: { replacementOperator: types.booleanLiteral(false), mutatorName: 'BooleanExpressionToFalse' },
  BooleanExpressionToTrue: { replacementOperator: types.booleanLiteral(true), mutatorName: 'BooleanExpressionToTrue' },
  DoWhileLoopToFalse: { replacementOperator: types.booleanLiteral(false), mutatorName: 'DoWhileLoopToFalse' },
  ForLoopToFalse: { replacementOperator: types.booleanLiteral(false), mutatorName: 'ForLoopToFalse' },
  IfToFalse: { replacementOperator: types.booleanLiteral(false), mutatorName: 'IfToFalse' },
  IfToTrue: { replacementOperator: types.booleanLiteral(true), mutatorName: 'IfToTrue' },
  WhileLoopToFalse: { replacementOperator: types.booleanLiteral(false), mutatorName: 'WhileLoopToFalse' },
  SwitchToEmpty: { replacementOperator: [], mutatorName: 'SwitchToEmpty' },
} as const);

export const conditionalExpressionMutator: NodeMutator = {
  name: 'ConditionalExpression',

  *mutate(path, operations) {
    if (isTestOfLoop(path)) {
      if (
        isTestOfWhileLoop(path) &&
        (operations === undefined || operations.includes(conditionalReplacements.WhileLoopToFalse.mutatorName as string))
      ) {
        yield conditionalReplacements.WhileLoopToFalse.replacementOperator;
      }

      if (
        isTestOfDoWhileLoop(path) &&
        (operations === undefined || operations.includes(conditionalReplacements.DoWhileLoopToFalse.mutatorName as string))
      ) {
        yield conditionalReplacements.DoWhileLoopToFalse.replacementOperator;
      }
      if (isTestOfForLoop(path) && (operations === undefined || operations.includes(conditionalReplacements.ForLoopToFalse.mutatorName as string))) {
        yield conditionalReplacements.ForLoopToFalse.replacementOperator;
      }
    } else if (isTestOfCondition(path)) {
      if (operations === undefined || operations.includes(conditionalReplacements.IfToTrue.mutatorName as string)) {
        yield conditionalReplacements.IfToTrue.replacementOperator;
      }
      if (operations === undefined || operations.includes(conditionalReplacements.IfToFalse.mutatorName as string)) {
        yield conditionalReplacements.IfToFalse.replacementOperator;
      }
    } else if (isBooleanExpression(path)) {
      if (path.parent?.type === 'LogicalExpression') {
        // For (x || y), do not generate the (true || y) mutation as it
        // has the same behavior as the (true) mutator, handled in the
        // isTestOfCondition branch above
        if (path.parent.operator === '||') {
          if (operations === undefined || operations.includes(conditionalReplacements.BooleanExpressionToFalse.mutatorName as string)) {
            yield conditionalReplacements.BooleanExpressionToFalse.replacementOperator;
          }
          return;
        }
        // For (x && y), do not generate the (false && y) mutation as it
        // has the same behavior as the (false) mutator, handled in the
        // isTestOfCondition branch above
        if (path.parent.operator === '&&') {
          if (operations === undefined || operations.includes(conditionalReplacements.BooleanExpressionToTrue.mutatorName as string)) {
            yield conditionalReplacements.BooleanExpressionToTrue.replacementOperator;
          }
          return;
        }
      }
      if (operations === undefined || operations.includes(conditionalReplacements.BooleanExpressionToTrue.mutatorName as string)) {
        yield conditionalReplacements.BooleanExpressionToTrue.replacementOperator;
      }
      if (operations === undefined || operations.includes(conditionalReplacements.BooleanExpressionToFalse.mutatorName as string)) {
        yield conditionalReplacements.BooleanExpressionToFalse.replacementOperator;
      }
    } else if (path.isForStatement() && !path.node.test) {
      if (operations === undefined || operations.includes(conditionalReplacements.ForLoopToFalse.mutatorName as string)) {
        const replacement = deepCloneNode(path.node);
        replacement.test = conditionalReplacements.ForLoopToFalse.replacementOperator;
        yield replacement;
      }
    } else if (path.isSwitchCase() && path.node.consequent.length > 0) {
      // if not a fallthrough case
      if (operations === undefined || operations.includes(conditionalReplacements.SwitchToEmpty.mutatorName as string)) {
        const replacement = deepCloneNode(path.node);
        replacement.consequent = conditionalReplacements.SwitchToEmpty.replacementOperator;
        yield replacement;
      }
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

function isTestOfWhileLoop(path: NodePath): boolean {
  const { parentPath } = path;
  if (!parentPath) {
    return false;
  }
  return parentPath.isWhileStatement() && parentPath.node.test === path.node;
}

function isTestOfForLoop(path: NodePath): boolean {
  const { parentPath } = path;
  if (!parentPath) {
    return false;
  }
  return parentPath.isForStatement() && parentPath.node.test === path.node;
}

function isTestOfDoWhileLoop(path: NodePath): boolean {
  const { parentPath } = path;
  if (!parentPath) {
    return false;
  }
  return parentPath.isDoWhileStatement() && parentPath.node.test === path.node;
}

function isTestOfCondition(path: NodePath): boolean {
  const { parentPath } = path;
  if (!parentPath) {
    return false;
  }
  return parentPath.isIfStatement() /*|| parentPath.isConditionalExpression()*/ && parentPath.node.test === path.node;
}

function isBooleanExpression(path: NodePath) {
  return (path.isBinaryExpression() || path.isLogicalExpression()) && booleanOperators.includes(path.node.operator);
}
