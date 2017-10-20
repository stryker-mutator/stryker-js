import { types } from 'babel-core';
import NodeMutator from './NodeMutator';

/**
 * Represents a mutator which can remove the conditional clause from statements.
 */
export default class RemoveConditionalsMutator implements NodeMutator {
  name = 'RemoveConditionals';

  constructor() { }

  mutate(node: types.Node, copy: <T extends types.Node>(obj: T, deep?: boolean) => T): types.Node[] | void {
    if ((types.isLoop(node) || types.isConditional(node)) && !types.isForXStatement(node)) {
      let nodes: types.Node[] = [];

      if (node.test) {
        nodes.push(this.booleanLiteralNode(node.test as any, false));
      } else {
        let mutatedNode = copy(node);
        mutatedNode.test = { start: node.start, end: node.end, loc: node.loc, type: 'BooleanLiteral', value: false };
        nodes.push(mutatedNode);
      }

      if (types.isConditional(node)) {
        nodes.push(this.booleanLiteralNode(node.test as any, true));
      }
      return nodes;
    }
  }

  private booleanLiteralNode(originalNode: types.Node, value: boolean): types.BooleanLiteral {
    return {
      start: originalNode.start,
      end: originalNode.end,
      loc: originalNode.loc,
      type: 'BooleanLiteral',
      value: value
    };
  }
}