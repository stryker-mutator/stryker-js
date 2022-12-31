import { NodePath, types } from '@babel/core';

import { NodeMutator } from './node-mutator.js';

export const functioncallRemoverMutator: NodeMutator = {
  name: 'FunctionCallRemover',

  *mutate(path) {
    //    console.log(path.node);
    if (path.isCallExpression()) {
      if (isOkayToRemove(path)) {
        yield types.tsUnknownKeyword();
      }
    }
  },
};

function isOkayToRemove(path: NodePath): boolean {
  return true;
}
