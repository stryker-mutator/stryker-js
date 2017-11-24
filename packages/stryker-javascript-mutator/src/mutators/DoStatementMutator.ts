import { types } from 'babel-core';
import NodeMutator from './NodeMutator';

/**
 * Represents a mutator which can remove the conditional clause from statements.
 */
export default class DoStatementMutator implements NodeMutator {
  name = 'DoStatement';

  constructor() { }

  mutate(node: types.Node, copy: <T extends types.Node>(obj: T, deep?: boolean) => T): types.Node[] | void {
    if (types.isDoWhileStatement(node)) {
        const mutatedNode: types.BooleanLiteral = {
          start: node.test.start,
          end: node.test.end,
          loc: node.test.loc,
          type: 'BooleanLiteral',
          value: false
        };
        return [mutatedNode];
    }
  }
}