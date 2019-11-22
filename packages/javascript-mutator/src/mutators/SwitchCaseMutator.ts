import * as types from '@babel/types';

import { NodeWithParent } from '../helpers/ParentNode';

import { NodeMutator } from './NodeMutator';

/**
 * Represents a mutator which can remove the content of a switch case clause.
 */
export default class SwitchCaseMutator implements NodeMutator {
  public name = 'SwitchCase';

  public mutate(node: NodeWithParent, copy: <T extends types.Node>(obj: T, deep?: boolean) => T): types.Node[] {
    const nodes: types.Node[] = [];

    if (
      types.isSwitchCase(node) &&
      // if not a fallthrough case
      node.consequent.length > 0
    ) {
      const mutatedNode = copy(node);
      mutatedNode.consequent = [];
      nodes.push(mutatedNode);
    }

    return nodes;
  }
}
