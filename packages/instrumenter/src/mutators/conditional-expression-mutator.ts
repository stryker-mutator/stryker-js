import babel, { Node, type NodePath } from '@babel/core';

import { ConditionalExpression } from '@stryker-mutator/api/core';

import { deepCloneNode } from '../util/index.js';

import { NodeMutator } from './node-mutator.js';

const booleanOperators = Object.freeze(['!=', '!==', '&&', '<', '<=', '==', '===', '>', '>=', '||']);

const { types } = babel;

export const conditionalExpressionMutator: NodeMutator<ConditionalExpression> = {
  name: 'ConditionalExpression',

  operators: {
    BooleanExpressionToFalseReplacement: {
      replacement: types.booleanLiteral(false),
      mutationOperator: 'BooleanExpressionToFalseReplacement',
    },
    BooleanExpressionToTrueReplacement: {
      replacement: types.booleanLiteral(true),
      mutationOperator: 'BooleanExpressionToTrueReplacement',
    },
    DoWhileLoopConditionToFalseReplacement: {
      replacement: types.booleanLiteral(false),
      mutationOperator: 'DoWhileLoopConditionToFalseReplacement',
    },
    ForLoopConditionToFalseReplacement: {
      replacement: types.booleanLiteral(false),
      mutationOperator: 'ForLoopConditionToFalseReplacement',
    },
    IfConditionToFalseReplacement: {
      replacement: types.booleanLiteral(false),
      mutationOperator: 'IfConditionToFalseReplacement',
    },
    IfConditionToTrueReplacement: {
      replacement: types.booleanLiteral(true),
      mutationOperator: 'IfConditionToTrueReplacement',
    },
    WhileLoopConditionToFalseReplacement: {
      replacement: types.booleanLiteral(false),
      mutationOperator: 'WhileLoopConditionToFalseReplacement',
    },
    SwitchStatementBodyRemoval: { replacement: [], mutationOperator: 'SwitchStatementBodyRemoval' },
  },

  *mutate(path) {
    if (isTestOfLoop(path)) {
      if (isTestOfWhileLoop(path)) {
        const { replacement, mutationOperator } = this.operators.WhileLoopConditionToFalseReplacement;
        yield [replacement as Node, mutationOperator];
      }

      if (isTestOfDoWhileLoop(path)) {
        const { replacement, mutationOperator } = this.operators.DoWhileLoopConditionToFalseReplacement;
        yield [replacement as Node, mutationOperator];
      }
      if (isTestOfForLoop(path)) {
        const { replacement, mutationOperator } = this.operators.ForLoopConditionToFalseReplacement;
        yield [replacement as Node, mutationOperator];
      }
    } else if (isTestOfCondition(path)) {
      yield [this.operators.IfConditionToTrueReplacement.replacement as Node, this.operators.IfConditionToTrueReplacement.mutationOperator];
      yield [this.operators.IfConditionToFalseReplacement.replacement as Node, this.operators.IfConditionToFalseReplacement.mutationOperator];
    } else if (isBooleanExpression(path)) {
      if (path.parent?.type === 'LogicalExpression') {
        // For (x || y), do not generate the (true || y) mutation as it
        // has the same behavior as the (true) mutator, handled in the
        // isTestOfCondition branch above
        if (path.parent.operator === '||') {
          const { replacement, mutationOperator } = this.operators.BooleanExpressionToFalseReplacement;
          yield [replacement as Node, mutationOperator];
          return;
        }
        // For (x && y), do not generate the (false && y) mutation as it
        // has the same behavior as the (false) mutator, handled in the
        // isTestOfCondition branch above
        if (path.parent.operator === '&&') {
          const { replacement, mutationOperator } = this.operators.BooleanExpressionToTrueReplacement;
          yield [replacement as Node, mutationOperator];
          return;
        }
      }
      yield [
        this.operators.BooleanExpressionToTrueReplacement.replacement as Node,
        this.operators.BooleanExpressionToTrueReplacement.mutationOperator,
      ];
      yield [
        this.operators.BooleanExpressionToFalseReplacement.replacement as Node,
        this.operators.BooleanExpressionToFalseReplacement.mutationOperator,
      ];
    } else if (path.isForStatement() && !path.node.test) {
      const nodeClone = deepCloneNode(path.node);
      const { replacement, mutationOperator } = this.operators.ForLoopConditionToFalseReplacement;
      nodeClone.test = replacement as babel.types.Expression;
      yield [nodeClone, mutationOperator];
    } else if (path.isSwitchCase() && path.node.consequent.length > 0) {
      // if not a fallthrough case
      const nodeClone = deepCloneNode(path.node);
      const { replacement, mutationOperator } = this.operators.SwitchStatementBodyRemoval;

      nodeClone.consequent = replacement as babel.types.Statement[];
      yield [nodeClone, mutationOperator];
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
  return parentPath !== null && parentPath && parentPath.isWhileStatement() && parentPath.node.test === path.node;
}

function isTestOfForLoop(path: NodePath): boolean {
  const { parentPath } = path;
  return parentPath !== null && parentPath && parentPath.isForStatement() && parentPath.node.test === path.node;
}

function isTestOfDoWhileLoop(path: NodePath): boolean {
  const { parentPath } = path;
  return parentPath !== null && parentPath.isDoWhileStatement() && parentPath.node.test === path.node;
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
