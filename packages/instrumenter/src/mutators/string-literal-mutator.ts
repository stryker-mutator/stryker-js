import babel, { type NodePath } from '@babel/core';

import { NodeMutatorConfiguration } from '../mutation-level/mutation-level.js';

import { NodeMutator } from './node-mutator.js';

const { types } = babel;

const operators: NodeMutatorConfiguration = {
  FillString: { replacement: types.stringLiteral('Stryker was here!'), mutationName: 'FillString' },
  EmptyString: { replacement: types.stringLiteral(''), mutationName: 'EmptyString' },
  EmptyInterpolation: { replacement: types.templateLiteral([types.templateElement({ raw: '' })], []), mutationName: 'EmptyInterpolation' },
  FillInterpolation: {
    replacement: types.templateLiteral([types.templateElement({ raw: 'Stryker was here!' })], []),
    mutationName: 'FillInterpolation',
  },
};

export const stringLiteralMutator: NodeMutator = {
  name: 'StringLiteral',

  *mutate(path, levelMutations) {
    if (path.isTemplateLiteral()) {
      const stringIsEmpty = path.node.quasis.length === 1 && path.node.quasis[0].value.raw.length === 0;
      if (
        levelMutations === undefined ||
        (stringIsEmpty && levelMutations.includes(operators.FillInterpolation.mutationName)) ||
        (!stringIsEmpty && levelMutations.includes(operators.EmptyInterpolation.mutationName))
      ) {
        yield stringIsEmpty ? operators.FillInterpolation.replacement : operators.EmptyInterpolation.replacement;
      }
    }
    if (path.isStringLiteral() && isValidParent(path)) {
      const stringIsEmpty = path.node.value.length === 0;
      if (
        levelMutations === undefined ||
        (stringIsEmpty && levelMutations.includes(operators.FillString.mutationName)) ||
        (!stringIsEmpty && levelMutations.includes(operators.EmptyString.mutationName))
      ) {
        yield stringIsEmpty ? operators.FillString.replacement : operators.EmptyString.replacement;
      }
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
