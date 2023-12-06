import babel, { type NodePath } from '@babel/core';

import { deepCloneNode } from '../util/index.js';

import { NodeMutatorConfiguration } from '../mutation-level/mutation-level.js';

import { NodeMutator } from './node-mutator.js';

const booleanOperators = Object.freeze(['!=', '!==', '&&', '<', '<=', '==', '===', '>', '>=', '||']);

const { types } = babel;

const operators: NodeMutatorConfiguration = {
  BooleanExpressionToFalse: { replacement: types.booleanLiteral(false), mutationName: 'BooleanExpressionToFalse' },
  BooleanExpressionToTrue: { replacement: types.booleanLiteral(true), mutationName: 'BooleanExpressionToTrue' },
  DoWhileLoopToFalse: { replacement: types.booleanLiteral(false), mutationName: 'DoWhileLoopToFalse' },
  ForLoopToFalse: { replacement: types.booleanLiteral(false), mutationName: 'ForLoopToFalse' },
  IfToFalse: { replacement: types.booleanLiteral(false), mutationName: 'IfToFalse' },
  IfToTrue: { replacement: types.booleanLiteral(true), mutationName: 'IfToTrue' },
  WhileLoopToFalse: { replacement: types.booleanLiteral(false), mutationName: 'WhileLoopToFalse' },
  SwitchToEmpty: { replacement: [], mutationName: 'SwitchToEmpty' },
};

export const conditionalExpressionMutator: NodeMutator = {
  name: 'ConditionalExpression',

  *mutate(path, levelMutations) {
    if (isTestOfLoop(path)) {
      if (isTestOfWhileLoop(path) && (levelMutations === undefined || levelMutations.includes(operators.WhileLoopToFalse.mutationName))) {
        yield operators.WhileLoopToFalse.replacement;
      }

      if (isTestOfDoWhileLoop(path) && (levelMutations === undefined || levelMutations.includes(operators.DoWhileLoopToFalse.mutationName))) {
        yield operators.DoWhileLoopToFalse.replacement;
      }
      if (isTestOfForLoop(path) && (levelMutations === undefined || levelMutations.includes(operators.ForLoopToFalse.mutationName))) {
        yield operators.ForLoopToFalse.replacement;
      }
    } else if (isTestOfCondition(path)) {
      if (levelMutations === undefined || levelMutations.includes(operators.IfToTrue.mutationName)) {
        yield operators.IfToTrue.replacement;
      }
      if (levelMutations === undefined || levelMutations.includes(operators.IfToFalse.mutationName)) {
        yield operators.IfToFalse.replacement;
      }
    } else if (isBooleanExpression(path)) {
      if (path.parent?.type === 'LogicalExpression') {
        // For (x || y), do not generate the (true || y) mutation as it
        // has the same behavior as the (true) mutator, handled in the
        // isTestOfCondition branch above
        if (path.parent.operator === '||') {
          if (levelMutations === undefined || levelMutations.includes(operators.BooleanExpressionToFalse.mutationName)) {
            yield operators.BooleanExpressionToFalse.replacement;
          }
          return;
        }
        // For (x && y), do not generate the (false && y) mutation as it
        // has the same behavior as the (false) mutator, handled in the
        // isTestOfCondition branch above
        if (path.parent.operator === '&&') {
          if (levelMutations === undefined || levelMutations.includes(operators.BooleanExpressionToTrue.mutationName)) {
            yield operators.BooleanExpressionToTrue.replacement;
          }
          return;
        }
      }
      if (levelMutations === undefined || levelMutations.includes(operators.BooleanExpressionToTrue.mutationName)) {
        yield operators.BooleanExpressionToTrue.replacement;
      }
      if (levelMutations === undefined || levelMutations.includes(operators.BooleanExpressionToFalse.mutationName)) {
        yield operators.BooleanExpressionToFalse.replacement;
      }
    } else if (path.isForStatement() && !path.node.test) {
      if (levelMutations === undefined || levelMutations.includes(operators.ForLoopToFalse.mutationName)) {
        const replacement = deepCloneNode(path.node);
        replacement.test = operators.ForLoopToFalse.replacement;
        yield replacement;
      }
    } else if (path.isSwitchCase() && path.node.consequent.length > 0) {
      // if not a fallthrough case
      if (levelMutations === undefined || levelMutations.includes(operators.SwitchToEmpty.mutationName)) {
        const replacement = deepCloneNode(path.node);
        replacement.consequent = operators.SwitchToEmpty.replacement;
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
