import * as types from '@babel/types';
import { NodeWithParent } from '../helpers/ParentNode';
import { NodeMutator } from './NodeMutator';

export default class StringLiteralMutator implements NodeMutator {
  public name = 'StringLiteral';

  public mutate(node: NodeWithParent, copy: <T extends types.Node>(obj: T, deep?: boolean) => T): types.Node[] {
    const nodes: types.Node[] = [];

    if (types.isTemplateLiteral(node)) {
      nodes.push({
        end: node.end,
        innerComments: node.innerComments,
        leadingComments: node.leadingComments,
        loc: node.loc,
        start: node.start,
        trailingComments: node.trailingComments,
        type: 'StringLiteral',
        value:
          (node.quasis.length === 1 && node.quasis[0].value.raw.length === 0)
          ? 'Stryker was here!'
          : ''
      } as types.StringLiteral);
    } else if ((!node.parent || this.isDeclarationOrJSX(node.parent)) && types.isStringLiteral(node)) {
      const mutatedNode = copy(node);
      mutatedNode.value = mutatedNode.value.length === 0 ? 'Stryker was here!' : '';
      nodes.push(mutatedNode);
    }

    return nodes;
  }

  private isDeclarationOrJSX(parent?: types.Node) {
    return !types.isImportDeclaration(parent) && !types.isExportDeclaration(parent) && !types.isJSXAttribute(parent);
  }
}
