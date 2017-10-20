import { types } from 'babel-core';
import { IdentifiedNode, Identified } from '../IdentifiedNode';
import NodeMutator from './NodeMutator';

export default class BooleanSubstitutionMutator implements NodeMutator {
  name = 'BooleanSubstitution';

  mutate(node: IdentifiedNode, copy: <T extends IdentifiedNode>(obj: T, deep?: boolean) => T): IdentifiedNode[] {
    const nodes: IdentifiedNode[] = [];
    
    // !a -> a
    if (types.isUnaryExpression(node) && node.operator === '!') {
      let mutatedNode = copy(node.argument as types.Expression & Identified);
      mutatedNode.nodeID = node.nodeID;
      mutatedNode.start = node.start;
      mutatedNode.end = node.end;
      nodes.push(mutatedNode);
    }

    // true -> false or false -> true
    if (types.isBooleanLiteral(node)) {
      let mutatedNode = copy(node);
      mutatedNode.value = !mutatedNode.value;
      nodes.push(mutatedNode);
    }

    return nodes;
  }
}