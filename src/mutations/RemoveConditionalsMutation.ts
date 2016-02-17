'use strict';

var _ = require('lodash');
var util = require('util');
import BaseMutation from './BaseMutation';
var Mutant = require('../Mutant');

/**
 * Represents a mutation which can remove the conditional clause from statements.
 * @class
 */
function RemoveConditionalsMutation() {
  BaseMutation.call(this, 'RemoveConditionals', ['DoWhileStatement', 'IfStatement', 'ForStatement', 'WhileStatement']);
}

util.inherits(RemoveConditionalsMutation, BaseMutation);

RemoveConditionalsMutation.prototype.applyMutation = function(filename, originalCode, node, ast) {
  BaseMutation.prototype.applyMutation.call(this, filename, originalCode, node, ast);
  var originalTest = node.test;

  var mutants = [];
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

RemoveConditionalsMutation.prototype.canMutate = function(node) {
  BaseMutation.prototype.canMutate.call(this, node);
  return !!(node && _.indexOf(this._types, node.type) >= 0);
};

module.exports = RemoveConditionalsMutation;
