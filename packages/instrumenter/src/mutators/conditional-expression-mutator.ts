import { NodePath, types } from '@babel/core';

import { NodeMutator } from './node-mutator';

const validOperators = Object.freeze(['!=', '!==', '&&', '<', '<=', '==', '===', '>', '>=', '||']);

export const conditionalExpressionMutator: NodeMutator = {
  name: 'ConditionalExpression',

  *mutate(path) {
    if (isTestOfALoop(path)) {
      yield types.booleanLiteral(false);
    } else if (isTestOfCondition(path)) {
      yield types.booleanLiteral(true);
      yield types.booleanLiteral(false);
    } else if ((path.isBinaryExpression() || path.isLogicalExpression()) && isValidOperator(path.node.operator)) {
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
function isTestOfALoop(path: NodePath): boolean {
  const { parentPath } = path;
  return (
    Boolean(parentPath) &&
    (parentPath.isForStatement() || parentPath.isWhileStatement() || parentPath.isDoWhileStatement()) &&
    parentPath.node.test === path.node
  );
}

function isTestOfCondition(path: NodePath): boolean {
  const { parentPath } = path;
  return Boolean(parentPath) && parentPath.isIfStatement() /*|| parentPath.isConditionalExpression()*/ && parentPath.node.test === path.node;
}

function isValidOperator(operator: string): boolean {
  return validOperators.includes(operator);
}
