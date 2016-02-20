'use strict';

var _ = require('lodash');
import BaseMutation from './BaseMutation';
import Mutant from '../Mutant';

/**
 * Represents a mutation which can remove the conditional clause from statements.
 * @class
 */
export default class RemoveConditionalsMutation extends BaseMutation {
  constructor() {
    super('RemoveConditionals', ['DoWhileStatement', 'IfStatement', 'ForStatement', 'WhileStatement']);
  }

  applyMutation(filename: string, originalCode: string, node, ast) {
    var originalTest = node.test;

    var mutants: Mutant[] = [];
    node.test = {
      type: 'Literal',
      value: false,
      raw: 'false'
    };
    mutants.push(new Mutant(filename, originalCode, this, ast, node, node.loc.start.column));
    if (node.type === 'IfStatement') {
      node.test.value = true;
      node.test.raw = node.test.value.toString();
      mutants.push(new Mutant(filename, originalCode, this, ast, node, node.loc.start.column));
    }

    node.test = originalTest;

    return mutants;
  };

  canMutate(node) {
    return !!(node && _.indexOf(this._types, node.type) >= 0);
  };

}
