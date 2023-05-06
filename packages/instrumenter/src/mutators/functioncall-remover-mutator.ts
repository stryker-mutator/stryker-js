import { NodePath, types } from '@babel/core';

import { NodeMutator } from './node-mutator.js';

export const functioncallRemoverMutator: NodeMutator = {
  name: 'FunctionCallRemover',

  *mutate(path) {
    //    console.log(path.node);
    if (path.isCallExpression()) {
      if (isOkayToRemove(path)) {
        yield types.nullLiteral();
      }
    }
  },
};

function isOkayToRemove(path: NodePath): boolean {
  return true;
}
