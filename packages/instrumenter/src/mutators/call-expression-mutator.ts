import babel, { type NodePath } from '@babel/core';
import { NodeMutator } from './node-mutator.js';
import { deepCloneNode } from '../util/index.js';
import { posix } from 'path';

const { types } = babel;

const strykerWasHere = (...arguments) => {
  return;
}

export const callExpressionMutator: NodeMutator = {
  name: 'CallExpression',

  // TODO: check if we do not remove too much (siblings)

  *mutate(path) {
    if (path.node.type === 'ExpressionStatement') {
      // const t = path.get('body');
      if (path.node.expression.type === 'CallExpression') {
        yield;
      }
    }

    // TODO Handle call expression within conditional expression
    // bar === 42 ? foo() : bar;
    // bar === 42 ? ; : foo();

    if (path.isCallExpression()) {
      
    }


  },
};

/*
Original:
  someFunctionCall();

Mutated:
  ;
*/


