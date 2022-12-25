import { NodePath, types } from '@babel/core';

import { ExpressionStatement, CallExpression } from '@babel/types';

import { NodeMutator } from './node-mutator.js';

export const statementRemoverMutator: NodeMutator = {
  name: 'StatementRemover',

  *mutate(path) {
    if (path.isStatement()) {
      if (isOkayToRemove(path)) {
        yield types.emptyStatement();
      }
    }
  },
};

function isOkayToRemove(path: NodePath): boolean {
  if (path.isBlockStatement()) {
    return false;
  }
  if (path.isClassDeclaration()) {
    return false;
  }
  if (path.isImportDeclaration()) {
    return false;
  }
  if (path.isExportNamedDeclaration()) {
    return false;
  }
  if (path.isVariableDeclaration()) {
    if(path.parentPath.isExportNamedDeclaration()) {
      return false;
    }
    return true;
  }
  if (path.isFunctionDeclaration()) {
    return false;
  }
  if (path.node.type == 'ExpressionStatement') {
    const stmt: ExpressionStatement = path.node;
    if (stmt.expression.type == 'CallExpression') {
      const ce: CallExpression = stmt.expression;
      if (ce.callee.type == 'Super') {
        return false;
      }
    }
  }
  return true;
}
