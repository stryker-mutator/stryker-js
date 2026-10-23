import { deepCloneNode } from '../util/index.js';

import { NodeMutator } from './index.js';

enum UpdateOperators {
  '++' = '--',
  '--' = '++',
}

export const updateOperatorMutator: NodeMutator = {
  name: 'UpdateOperator',

  *mutate(path) {
    if (path.isUpdateExpression()) {
      const mutant = deepCloneNode(path.node);
      mutant.operator = UpdateOperators[path.node.operator];

      yield mutant;
    }
  },
};
