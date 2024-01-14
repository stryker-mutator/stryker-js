import babel, { type NodePath } from '@babel/core';

import { StringLiteral } from '@stryker-mutator/api/core';

import { NodeMutator } from './node-mutator.js';

const { types } = babel;

export const stringLiteralMutator: NodeMutator<StringLiteral> = {
  name: 'StringLiteral',

  operators: {
    EmptyStringLiteralToFilledReplacement: {
      replacement: types.stringLiteral('Stryker was here!'),
      mutationName: 'EmptyStringLiteralToFilledReplacement',
    },
    FilledStringLiteralToEmptyReplacement: {
      replacement: types.stringLiteral(''),
      mutationName: 'FilledStringLiteralToEmptyReplacement',
    },
    FilledInterpolatedStringToEmptyReplacement: {
      replacement: types.templateLiteral([types.templateElement({ raw: '' })], []),
      mutationName: 'FilledInterpolatedStringToEmptyReplacement',
    },
    EmptyInterpolatedStringToFilledReplacement: {
      replacement: types.templateLiteral([types.templateElement({ raw: 'Stryker was here!' })], []),
      mutationName: 'EmptyInterpolatedStringToFilledReplacement',
    },
  },

  *mutate(path, levelMutations) {
    if (path.isTemplateLiteral()) {
      const stringIsEmpty = path.node.quasis.length === 1 && path.node.quasis[0].value.raw.length === 0;
      if (
        levelMutations === undefined ||
        (stringIsEmpty && levelMutations.includes(this.operators.EmptyInterpolatedStringToFilledReplacement.mutationName)) ||
        (!stringIsEmpty && levelMutations.includes(this.operators.FilledInterpolatedStringToEmptyReplacement.mutationName))
      ) {
        yield stringIsEmpty
          ? this.operators.EmptyInterpolatedStringToFilledReplacement.replacement
          : this.operators.FilledInterpolatedStringToEmptyReplacement.replacement;
      }
    }
    if (path.isStringLiteral() && isValidParent(path)) {
      const stringIsEmpty = path.node.value.length === 0;
      if (
        levelMutations === undefined ||
        (stringIsEmpty && levelMutations.includes(this.operators.EmptyStringLiteralToFilledReplacement.mutationName)) ||
        (!stringIsEmpty && levelMutations.includes(this.operators.FilledStringLiteralToEmptyReplacement.mutationName))
      ) {
        yield stringIsEmpty
          ? this.operators.EmptyStringLiteralToFilledReplacement.replacement
          : this.operators.FilledStringLiteralToEmptyReplacement.replacement;
      }
    }
  },

  numberOfMutants(path): number {
    return path.isTemplateLiteral() || (path.isStringLiteral() && isValidParent(path)) ? 1 : 0;
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
