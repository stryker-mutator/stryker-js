import babel, { type NodePath } from '@babel/core';

import { ConditionalExpression } from '@stryker-mutator/api/core';

import { deepCloneNode } from '../util/index.js';

import { NodeMutator } from './node-mutator.js';

const booleanOperators = Object.freeze(['!=', '!==', '&&', '<', '<=', '==', '===', '>', '>=', '||']);

const { types } = babel;

export const conditionalExpressionMutator: NodeMutator<ConditionalExpression> = {
  name: 'ConditionalExpression',

  operators: {
    BooleanExpressionToFalseReplacement: { replacement: types.booleanLiteral(false), mutationName: 'BooleanExpressionToFalseReplacement' },
    BooleanExpressionToTrueReplacement: { replacement: types.booleanLiteral(true), mutationName: 'BooleanExpressionToTrueReplacement' },
    DoWhileLoopConditionToFalseReplacement: { replacement: types.booleanLiteral(false), mutationName: 'DoWhileLoopConditionToFalseReplacement' },
    ForLoopConditionToFalseReplacement: { replacement: types.booleanLiteral(false), mutationName: 'ForLoopConditionToFalseReplacement' },
    IfConditionToFalseReplacement: { replacement: types.booleanLiteral(false), mutationName: 'IfConditionToFalseReplacement' },
    IfConditionToTrueReplacement: { replacement: types.booleanLiteral(true), mutationName: 'IfConditionToTrueReplacement' },
    WhileLoopConditionToFalseReplacement: { replacement: types.booleanLiteral(false), mutationName: 'WhileLoopConditionToFalseReplacement' },
    SwitchStatementBodyRemoval: { replacement: [], mutationName: 'SwitchStatementBodyRemoval' },
  },

  *mutate(path, levelMutations) {
    if (isTestOfLoop(path)) {
      if (
        isTestOfWhileLoop(path) &&
        (levelMutations === undefined || levelMutations.includes(this.operators.WhileLoopConditionToFalseReplacement.mutationName))
      ) {
        yield this.operators.WhileLoopConditionToFalseReplacement.replacement;
      }

      if (
        isTestOfDoWhileLoop(path) &&
        (levelMutations === undefined || levelMutations.includes(this.operators.DoWhileLoopConditionToFalseReplacement.mutationName))
      ) {
        yield this.operators.DoWhileLoopConditionToFalseReplacement.replacement;
      }
      if (
        isTestOfForLoop(path) &&
        (levelMutations === undefined || levelMutations.includes(this.operators.ForLoopConditionToFalseReplacement.mutationName))
      ) {
        yield this.operators.ForLoopConditionToFalseReplacement.replacement;
      }
    } else if (isTestOfCondition(path)) {
      if (levelMutations === undefined || levelMutations.includes(this.operators.IfConditionToTrueReplacement.mutationName)) {
        yield this.operators.IfConditionToTrueReplacement.replacement;
      }
      if (levelMutations === undefined || levelMutations.includes(this.operators.IfConditionToFalseReplacement.mutationName)) {
        yield this.operators.IfConditionToFalseReplacement.replacement;
      }
    } else if (isBooleanExpression(path)) {
      if (path.parent?.type === 'LogicalExpression') {
        // For (x || y), do not generate the (true || y) mutation as it
        // has the same behavior as the (true) mutator, handled in the
        // isTestOfCondition branch above
        if (path.parent.operator === '||') {
          if (levelMutations === undefined || levelMutations.includes(this.operators.BooleanExpressionToFalseReplacement.mutationName)) {
            yield this.operators.BooleanExpressionToFalseReplacement.replacement;
          }
          return;
        }
        // For (x && y), do not generate the (false && y) mutation as it
        // has the same behavior as the (false) mutator, handled in the
        // isTestOfCondition branch above
        if (path.parent.operator === '&&') {
          if (levelMutations === undefined || levelMutations.includes(this.operators.BooleanExpressionToTrueReplacement.mutationName)) {
            yield this.operators.BooleanExpressionToTrueReplacement.replacement;
          }
          return;
        }
      }
      if (levelMutations === undefined || levelMutations.includes(this.operators.BooleanExpressionToTrueReplacement.mutationName)) {
        yield this.operators.BooleanExpressionToTrueReplacement.replacement;
      }
      if (levelMutations === undefined || levelMutations.includes(this.operators.BooleanExpressionToFalseReplacement.mutationName)) {
        yield this.operators.BooleanExpressionToFalseReplacement.replacement;
      }
    } else if (path.isForStatement() && !path.node.test) {
      if (levelMutations === undefined || levelMutations.includes(this.operators.ForLoopConditionToFalseReplacement.mutationName)) {
        const replacement = deepCloneNode(path.node);
        replacement.test = this.operators.ForLoopConditionToFalseReplacement.replacement;
        yield replacement;
      }
    } else if (path.isSwitchCase() && path.node.consequent.length > 0) {
      // if not a fallthrough case
      if (levelMutations === undefined || levelMutations.includes(this.operators.SwitchStatementBodyRemoval.mutationName)) {
        const replacement = deepCloneNode(path.node);
        replacement.consequent = this.operators.SwitchStatementBodyRemoval.replacement;
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
