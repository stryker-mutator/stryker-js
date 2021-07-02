import * as types from '@babel/types';

import { NodeMutator } from '.';

enum UpdateOperators {
  '++' = '--',
  '--' = '++',
}

export const updateOperatorMutator: NodeMutator = {
  name: 'UpdateOperator',

  *mutate(path) {
    if (path.isUpdateExpression()) {
      yield types.updateExpression(UpdateOperators[path.node.operator], path.node.argument, path.node.prefix);
    }
  },
};
