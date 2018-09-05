import { types } from 'babel-core';
import { partition } from 'lodash';

import NodeMutator from './NodeMutator';
import NodeGenerator from '../helpers/NodeGenerator';

/**
 * Returns true if a switch case statement is the default one
 */
function isDefaultSwitchCase(switchCase: types.SwitchCase): boolean {
  return switchCase.test === null;
}

/**
 * Represents a mutator which can remove the conditional clause from statements.
 */
export default class SwitchStatementMutator implements NodeMutator {
  public name = 'SwitchStatement';

  public mutate(node: types.Node, copy: <T extends types.Node>(obj: T, deep?: boolean) => T): types.Node[] | void {
    if (types.isSwitchStatement(node)) {
      const [defaultCases, nonDefaultCases] = partition(node.cases, isDefaultSwitchCase);
      if (nonDefaultCases.length > 0) {
        const mutatedNode = copy(node);
        mutatedNode.cases = defaultCases;
        return [mutatedNode];
      }
    }
  }
}
