import babel, { type NodePath } from '@babel/core';

import { NodeMutator } from './node-mutator.js';

const { types } = babel;

export const stringLiteralMutator: NodeMutator = {
  name: 'StringLiteral',

  *mutate(path) {
    if (path.isTemplateLiteral()) {
      const replacement =
        path.node.quasis.length === 1 &&
        path.node.quasis[0].value.raw.length === 0
          ? 'Stryker was here!'
          : '';
      yield types.templateLiteral(
        [types.templateElement({ raw: replacement })],
        [],
      );
    }
    if (path.isStringLiteral() && isValidParent(path)) {
      yield types.stringLiteral(
        path.node.value.length === 0 ? 'Stryker was here!' : '',
      );
    }
  },
};

function isValidParent(child: NodePath<babel.types.StringLiteral>): boolean {
  const { parent } = child;
  return !(
    types.isImportDeclaration(parent) ||
    types.isExportDeclaration(parent) ||
    types.isImportOrExportDeclaration(parent) ||
    types.isTSExternalModuleReference(parent) ||
    types.isJSXAttribute(parent) ||
    types.isExpressionStatement(parent) ||
    types.isTSLiteralType(parent) ||
    types.isObjectMethod(parent) ||
    (types.isObjectProperty(parent) && parent.key === child.node) ||
    (types.isClassProperty(parent) && parent.key === child.node) ||
    (types.isCallExpression(parent) &&
      types.isIdentifier(parent.callee, { name: 'require' })) ||
    (types.isCallExpression(parent) &&
      types.isIdentifier(parent.callee, { name: 'Symbol' }))
  );
}
