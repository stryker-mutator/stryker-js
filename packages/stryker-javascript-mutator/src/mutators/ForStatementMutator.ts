import { types } from 'babel-core';
import NodeMutator from './NodeMutator';

/**
 * Represents a mutator which can remove the conditional clause from statements.
 */
export default class ForStatementMutator implements NodeMutator {
  name = 'ForStatement';

  constructor() { }

  mutate(node: types.Node, copy: <T extends types.Node>(obj: T, deep?: boolean) => T): types.Node[] | void {
    if (types.isForStatement(node)) {
      if (!node.test) {
        let mutatedNode = copy(node) as types.ForStatement;
        mutatedNode.test = { start: node.start, end: node.end, loc: node.loc, type: 'BooleanLiteral', value: false };
        return [mutatedNode];
      } else {
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
}