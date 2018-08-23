import { types } from 'babel-core';
import NodeMutator from './NodeMutator';
import { NodeWithParent } from '../helpers/ParentNode';

export default class StringLiteralMutator implements NodeMutator {
  public name = 'StringLiteral';

  public mutate(node: NodeWithParent, copy: <T extends types.Node>(obj: T, deep?: boolean) => T): types.Node[] {
    const nodes: types.Node[] = [];

    if (types.isTemplateLiteral(node)) {
      const mutatedNode: types.StringLiteral = {
        end: node.end,
        loc: node.loc,
        start: node.start,
        type: 'StringLiteral',
        value: ''
      };

      if (node.quasis.length === 1 && node.quasis[0].value.raw.length === 0) {
        mutatedNode.value = 'Stryker was here!';
      }

      nodes.push(mutatedNode);
    } else if ((!node.parent || (!types.isImportDeclaration(node.parent) && !types.isJSXAttribute(node.parent)))
      && types.isStringLiteral(node)) {
      const mutatedNode = copy(node);
      mutatedNode.value = mutatedNode.value.length === 0 ? 'Stryker was here!' : '';
      nodes.push(mutatedNode);
    }

    return nodes;
  }
}
