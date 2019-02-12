import * as types from '@babel/types';
import { NodeMutator } from './NodeMutator';

export default class BooleanSubstitutionMutator implements NodeMutator {
  public name = 'BooleanSubstitution';

  public mutate(node: types.Node, copy: <T extends types.Node>(obj: T, deep?: boolean) => T): types.Node[] {
    const nodes: types.Node[] = [];

    // true -> false or false -> true
    if (types.isBooleanLiteral(node)) {
      const mutatedNode = copy(node);
      mutatedNode.value = !mutatedNode.value;
      nodes.push(mutatedNode);
    }

    return nodes;
  }
}
