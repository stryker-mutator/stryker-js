import { types, NodePath } from '@babel/core';

import { NodeMutation } from '../mutant';

import { NodeMutator } from './node-mutator';

export class StringLiteralMutator implements NodeMutator {
  public name = 'StringLiteral';

  public mutate(path: NodePath): NodeMutation[] {
    if (path.isTemplateLiteral()) {
      const replacement = path.node.quasis.length === 1 && path.node.quasis[0].value.raw.length === 0 ? 'Stryker was here!' : '';
      return [
        {
          original: path.node,
          replacement: types.templateLiteral([types.templateElement({ raw: replacement })], []),
        },
      ];
    }
    if (path.isStringLiteral() && this.isValidParent(path)) {
      return [
        {
          original: path.node,
          replacement: types.stringLiteral(path.node.value.length === 0 ? 'Stryker was here!' : ''),
        },
      ];
    }

    return [];
  }

  private isValidParent(child: NodePath<types.StringLiteral>): boolean {
    const parent = child.parent;
    return !(
      types.isImportDeclaration(parent) ||
      types.isExportDeclaration(parent) ||
      types.isModuleDeclaration(parent) ||
      types.isTSExternalModuleReference(parent) ||
      types.isJSXAttribute(parent) ||
      types.isExpressionStatement(parent) ||
      types.isTSLiteralType(parent) ||
      (types.isObjectProperty(parent) && parent.key === child.node) ||
      (types.isClassProperty(parent) && parent.key === child.node) ||
      (types.isCallExpression(parent) && types.isIdentifier(parent.callee, { name: 'require' }))
    );
  }
}
