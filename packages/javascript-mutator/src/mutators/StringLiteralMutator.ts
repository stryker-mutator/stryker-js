import * as types from '@babel/types';

import { NodeGenerator } from '../helpers/NodeGenerator';
import { NodeWithParent } from '../helpers/ParentNode';

import { NodeMutator } from './NodeMutator';

const MUTATED_STRING_CONTENTS = '**Stryker was here!**';

export default class StringLiteralMutator implements NodeMutator {
  public name = 'StringLiteral';

  public mutate(node: NodeWithParent, copy: <T extends types.Node>(obj: T, deep?: boolean) => T): types.Node[] {
    const nodes: types.Node[] = [];

    if (types.isTemplateLiteral(node)) {
      if (node.expressions.length !== 0 || node.quasis.length > 1 || (node.quasis.length === 1 && node.quasis[0].value.raw !== '')) {
        nodes.push(NodeGenerator.createStringLiteralNode(node, ''));
      }
      nodes.push(NodeGenerator.createStringLiteralNode(node, MUTATED_STRING_CONTENTS));
      nodes.push(NodeGenerator.createIdentifierNode(node, 'null'));
    } else if ((!node.parent || this.isDeclarationOrJSX(node.parent)) && types.isStringLiteral(node)) {
      if (node.value.length !== 0) {
        nodes.push(NodeGenerator.createStringLiteralNode(node, ''));
      }
      nodes.push(NodeGenerator.createStringLiteralNode(node, MUTATED_STRING_CONTENTS));
      if (types.isStringLiteral(node)) {
        nodes.push(NodeGenerator.createIdentifierNode(node, 'null'));
      }
    }

    return nodes;
  }

  private isDeclarationOrJSX(parent?: types.Node) {
    return !types.isImportDeclaration(parent) && !types.isExportDeclaration(parent) && !types.isJSXAttribute(parent);
  }
}
