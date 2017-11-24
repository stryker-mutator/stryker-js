import { types } from 'babel-core';
import NodeMutator from './NodeMutator';

/**
 * Represents a mutator which can remove the conditional clause from statements.
 */
export default class IfStatementMutator implements NodeMutator {
  name = 'IfStatement';

  constructor() { }

  mutate(node: types.Node, copy: <T extends types.Node>(obj: T, deep?: boolean) => T): types.Node[] | void {
    if (types.isIfStatement(node)) {
        const mutatedNodes: types.BooleanLiteral[] = [{
            start: node.test.start,
            end: node.test.end,
            loc: node.test.loc,
            type: 'BooleanLiteral',
            value: false
        }, {
            start: node.test.start,
            end: node.test.end,
            loc: node.test.loc,
            type: 'BooleanLiteral',
            value: true
        }];
        return mutatedNodes;
    }
  }
}