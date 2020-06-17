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
    } else if (this.isDeclarationOrJSX(path.parent) && path.isStringLiteral()) {
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

  private isDeclarationOrJSX(parent?: types.Node): boolean {
    return !types.isImportDeclaration(parent) && !types.isExportDeclaration(parent) && !types.isJSXAttribute(parent);
  }
}
