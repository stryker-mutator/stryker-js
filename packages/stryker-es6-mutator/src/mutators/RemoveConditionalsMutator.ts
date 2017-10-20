import { types } from 'babel-core';
import { IdentifiedNode, Identified } from '../IdentifiedNode';
import NodeMutator from './NodeMutator';

/**
 * Represents a mutator which can remove the conditional clause from statements.
 */
export default class RemoveConditionalsMutator implements NodeMutator {
  name = 'RemoveConditionals';

  constructor() { }

  mutate(node: IdentifiedNode, copy: <T extends IdentifiedNode>(obj: T, deep?: boolean) => T): IdentifiedNode[] | void {
    if ((types.isLoop(node) || types.isConditional(node)) && !types.isForXStatement(node)) {
      let nodes: IdentifiedNode[] = [];

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

  private booleanLiteralNode(originalNode: IdentifiedNode, value: boolean): types.BooleanLiteral & Identified {
    return {
      nodeID: originalNode.nodeID,
      start: originalNode.start,
      end: originalNode.end,
      loc: originalNode.loc,
      type: 'BooleanLiteral',
      value: value
    };
  }
}