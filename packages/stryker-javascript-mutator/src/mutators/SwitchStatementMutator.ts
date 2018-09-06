import { types } from 'babel-core';

import NodeMutator from './NodeMutator';

/**
 * Represents a mutator which can remove individual clauses from switch statements.
 */
export default class SwitchStatementMutator implements NodeMutator {
  public name = 'SwitchStatement';

  public mutate(node: types.Node, copy: <T extends types.Node>(obj: T, deep?: boolean) => T): types.Node[] | void {
    if (types.isSwitchStatement(node)) {
      const mutatedNodes = node.cases.map(function (_, i) {
        const mutatedNode = copy(node);
        mutatedNode.cases = node.cases.filter(function (_, j) {
          return i !== j;
        });
        return mutatedNode;
      });
      return mutatedNodes;
    }
  }
}