import * as types from '@babel/types';
import { NodeMutator } from './NodeMutator';

export default class BooleanSubstitutionMutator implements NodeMutator {
  public name = 'BooleanSubstitution';

  public mutate(node: types.Node, copy: <T extends types.Node>(obj: T, deep?: boolean) => T): types.Node[] {
    // true -> false or false -> true
    if (types.isBooleanLiteral(node)) {
      const mutatedNode = copy(node);
      mutatedNode.value = !mutatedNode.value;
      return [mutatedNode];
    }

    return [];
  }
}
