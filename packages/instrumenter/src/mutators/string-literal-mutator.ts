import babel, { Node, type NodePath } from '@babel/core';

import { StringLiteral } from '@stryker-mutator/api/core';

import { NodeMutator } from './node-mutator.js';

const { types } = babel;

export const stringLiteralMutator: NodeMutator<StringLiteral> = {
  name: 'StringLiteral',

  operators: {
    EmptyStringLiteralToFilledReplacement: {
      replacement: types.stringLiteral('Stryker was here!'),
      mutationOperator: 'EmptyStringLiteralToFilledReplacement',
    },
    FilledStringLiteralToEmptyReplacement: {
      replacement: types.stringLiteral(''),
      mutationOperator: 'FilledStringLiteralToEmptyReplacement',
    },
    FilledInterpolatedStringToEmptyReplacement: {
      replacement: types.templateLiteral([types.templateElement({ raw: '' })], []),
      mutationOperator: 'FilledInterpolatedStringToEmptyReplacement',
    },
    EmptyInterpolatedStringToFilledReplacement: {
      replacement: types.templateLiteral([types.templateElement({ raw: 'Stryker was here!' })], []),
      mutationOperator: 'EmptyInterpolatedStringToFilledReplacement',
    },
  },

  *mutate(path) {
    if (path.isTemplateLiteral()) {
      const stringIsEmpty = path.node.quasis.length === 1 && path.node.quasis[0].value.raw.length === 0;

      const { replacement, mutationOperator } = stringIsEmpty
        ? this.operators.EmptyInterpolatedStringToFilledReplacement
        : this.operators.FilledInterpolatedStringToEmptyReplacement;

      yield [replacement as Node, mutationOperator];
    }
    if (path.isStringLiteral() && isValidParent(path)) {
      const stringIsEmpty = path.node.value.length === 0;

      const { replacement, mutationOperator } = stringIsEmpty
        ? this.operators.EmptyStringLiteralToFilledReplacement
        : this.operators.FilledStringLiteralToEmptyReplacement;

      yield [replacement as Node, mutationOperator];
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
    (types.isCallExpression(parent) && types.isIdentifier(parent.callee, { name: 'require' })) ||
    (types.isCallExpression(parent) && types.isIdentifier(parent.callee, { name: 'Symbol' }))
  );
}
