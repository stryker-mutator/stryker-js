import * as types from '@babel/types';

import { NodeMutator } from './NodeMutator';

export default class LogicalOperatorMutator implements NodeMutator {
  private readonly operators: { [targetedOperator: string]: string | string[] } = {
    '&&': '||',
    '||': '&&'
  };

  public name = 'LogicalOperator';

  public mutate(node: types.Node, clone: <T extends types.Node>(node: T, deep?: boolean) => T): types.Node[] {
    if (types.isLogicalExpression(node)) {
      let mutatedOperators = this.operators[node.operator];
      if (mutatedOperators) {
        if (typeof mutatedOperators === 'string') {
          mutatedOperators = [mutatedOperators];
        }

        return mutatedOperators.map<types.Node>(mutatedOperator => {
          const mutatedNode = clone(node);
          mutatedNode.operator = mutatedOperator as any;
          return mutatedNode;
        });
      }
    }

    return [];
  }
}
