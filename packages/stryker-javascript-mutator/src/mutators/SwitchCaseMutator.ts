import { types } from 'babel-core';

import NodeMutator from './NodeMutator';

/**
 * Represents a mutator which can remove the content of a switch case clause.
 */
export default class SwitchCaseMutator implements NodeMutator {
  public name = 'SwitchCase';

  public mutate(node: types.Node, copy: <T extends types.Node>(obj: T, deep?: boolean) => T): types.Node[] | void {
    if (types.isSwitchCase(node)) {
      // if not a fallthrough case
      if (node.consequent.length > 0) {
        const mutatedNode = copy(node);
        mutatedNode.consequent = [];
        return [mutatedNode];
      }
    }
  }
}
