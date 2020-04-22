import * as types from '@babel/types';

import { NodeWithParent } from '../helpers/ParentNode';

import { NodeMutator } from './NodeMutator';

export default class StringLiteralMutator implements NodeMutator {
  public name = 'StringLiteral';

  public mutate(node: NodeWithParent): Array<[types.Node, types.Node | { raw: string }]> {
    if (types.isTemplateLiteral(node)) {
      return [
        [
          node,
          {
            raw: node.quasis.length === 1 && node.quasis[0].value.raw.length === 0 ? '"Stryker was here!"' : '""',
          },
        ],
      ];
    } else if ((!node.parent || this.isDeclarationOrJSX(node.parent)) && types.isStringLiteral(node)) {
      return [[node, { raw: node.value.length === 0 ? '"Stryker was here!"' : '""' }]];
    } else {
      return [];
    }
  }

  private isDeclarationOrJSX(parent?: types.Node) {
    return !types.isImportDeclaration(parent) && !types.isExportDeclaration(parent) && !types.isJSXAttribute(parent);
  }
}
