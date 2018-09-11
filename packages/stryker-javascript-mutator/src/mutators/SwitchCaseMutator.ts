import { types } from 'babel-core';

import NodeMutator from './NodeMutator';

/**
 * Given an array of length n, return an array length n of arrays length n-1
 * where each item has been removed in sequence
 *
 * e.g. [0, 1, 2] -> [[1, 2], [0, 2], [0, 1]]
 */
const sequentialSplices = <T>(collection: T[]): T[][] => {
  return collection.map((_, i) => {
    return collection.filter((_, j) => {
      return i !== j;
    });
  });
};

/**
 * Represents a mutator which can remove individual clauses from switch statements.
 */
export default class SwitchCaseMutator implements NodeMutator {
  public name = 'SwitchCase';

  public mutate(node: types.Node, copy: <T extends types.Node>(obj: T, deep?: boolean) => T): types.Node[] | void {
    if (types.isSwitchCase(node)) {
      // Generate possible case arrays
      const caseSplices = sequentialSplices(node.cases);
      // Map onto cloned nodes
      return caseSplices.map(caseSplice => {
        const mutatedNode = copy(node);
        mutatedNode.cases = caseSplice;
        return mutatedNode;
      });
    }
  }
}
