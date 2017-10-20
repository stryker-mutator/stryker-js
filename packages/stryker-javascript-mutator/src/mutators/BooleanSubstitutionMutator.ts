import { types } from 'babel-core';
import NodeMutator from './NodeMutator';

export default class BooleanSubstitutionMutator implements NodeMutator {
  name = 'BooleanSubstitution';

  mutate(node: types.Node, copy: <T extends types.Node>(obj: T, deep?: boolean) => T): types.Node[] {
    const nodes: types.Node[] = [];
    
    // !a -> a
    if (types.isUnaryExpression(node) && node.operator === '!') {
      let mutatedNode = copy(node.argument);
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