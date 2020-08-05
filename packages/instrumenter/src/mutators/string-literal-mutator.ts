import { types, NodePath } from '@babel/core';

import { NodeMutation } from '../mutant';

import { NodeMutator } from './node-mutator';

export class StringLiteralMutator implements NodeMutator {
  public name = 'StringLiteral';

  public mutate(path: NodePath): NodeMutation[] {
    if (path.isTemplateLiteral()) {
      if (path.node.quasis.length === 1 && path.node.quasis[0].value.raw.length === 0) {
        return [
          {
            original: path.node,
            replacement: types.templateLiteral([types.templateElement({ raw: 'Stryker was here!' })], []),
          },
        ];
      } else {
        return [
          {
            original: path.node,
            replacement: types.templateLiteral([types.templateElement({ raw: '' })], []),
          },
        ];
      }
    } else if (path.isStringLiteral() && this.isValidParent(path.parent)) {
      return [
        {
          original: path.node,
          replacement: types.stringLiteral(path.node.value.length === 0 ? 'Stryker was here!' : ''),
        },
      ];
    } else {
      return [];
    }
  }

  private isValidParent(parent?: types.Node): boolean {
    return !(
      types.isImportDeclaration(parent) ||
      types.isExportDeclaration(parent) ||
      types.isModuleDeclaration(parent) ||
      types.isTSExternalModuleReference(parent) ||
      types.isJSXAttribute(parent) ||
      types.isExpressionStatement(parent) ||
      types.isTSLiteralType(parent) ||
      types.isObjectProperty(parent) ||
      (types.isCallExpression(parent) && types.isIdentifier(parent.callee, { name: 'require' }))
    );
  }
}
