import babel, { type NodePath } from '@babel/core';

import { NodeMutator } from './node-mutator.js';
import { MutationOperator } from './mutation-level-options.js';

const { types } = babel;

const operators: MutationOperator = {
  FillString: { replacementOperator: types.stringLiteral('Stryker was here!'), mutatorName: 'FillString' },
  EmptyString: { replacementOperator: types.stringLiteral(''), mutatorName: 'EmptyString' },
  EmptyInterpolation: { replacementOperator: types.templateLiteral([types.templateElement({ raw: '' })], []), mutatorName: 'EmptyInterpolation' },
  FillInterpolation: {
    replacementOperator: types.templateLiteral([types.templateElement({ raw: 'Stryker was here!' })], []),
    mutatorName: 'FillInterpolation',
  },
};

export const stringLiteralMutator: NodeMutator = {
  name: 'StringLiteral',

  *mutate(path, operations: string[] | undefined) {
    if (path.isTemplateLiteral()) {
      const stringIsEmpty = path.node.quasis.length === 1 && path.node.quasis[0].value.raw.length === 0;
      if (
        operations === undefined ||
        (stringIsEmpty && operations.includes(operators.FillInterpolation.mutatorName)) ||
        (!stringIsEmpty && operations.includes(operators.EmptyInterpolation.mutatorName))
      ) {
        yield stringIsEmpty ? operators.FillInterpolation.replacementOperator : operators.EmptyInterpolation.replacementOperator;
      }
    }
    if (path.isStringLiteral() && isValidParent(path)) {
      const stringIsEmpty = path.node.value.length === 0;
      if (
        operations === undefined ||
        (stringIsEmpty && operations.includes(operators.FillString.mutatorName)) ||
        (!stringIsEmpty && operations.includes(operators.EmptyString.mutatorName))
      ) {
        yield stringIsEmpty ? operators.FillString.replacementOperator : operators.EmptyString.replacementOperator;
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
