'use strict';

var _ = require('lodash');
var util = require('util');
var BaseMutation = require('./BaseMutation');
var Mutant = require('../Mutant');
var ParserUtils = require('../utils/ParserUtils');

/**
 * Represents a base class for all operator based mutations.
 * @class
 * @param {String} name - The name of the mutation.
 * @param {String[]} types - The types of mutation as expected by the parser.
 * @param {Object} operators - The object containing all operators and their counterparts.
 */
function BaseOperatorMutation(name, types, operators) {
  BaseMutation.call(this, name, types);
  this._typeUtils.expectParameterObject(operators, 'BaseOperatorMutation', 'operators');

  this._operators = operators;
}

util.inherits(BaseOperatorMutation, BaseMutation);

BaseOperatorMutation.prototype.applyMutation = function(filename, originalCode, node, ast) {
  BaseMutation.prototype.applyMutation.call(this, filename, originalCode, node, ast);
  var originalOperator = node.operator;
  var mutants = [];
  node.operator = this.getOperator(node.operator);

  var parserUtils = new ParserUtils();
  var lineOfCode = parserUtils.generate(node);
  // Use native indexOf because the operator may be multiple characters.
  var columnNumber = (lineOfCode.indexOf(node.operator) + 1) + node.loc.start.column;
  mutants.push(new Mutant(filename, originalCode, this, ast, node, columnNumber));

  node.operator = originalOperator;

  return mutants;
};

BaseOperatorMutation.prototype.canMutate = function(node) {
  BaseMutation.prototype.canMutate.call(this, node);
  return !!(node && _.indexOf(this._types, node.type) >= 0 && this.getOperator(node.operator));
};

/**
 * Gets the mutated operator based on an unmutated operator.
 * @function
 * @param {String} operator - An umutated operator.
 * @returns {String} The mutated operator.
 */
BaseOperatorMutation.prototype.getOperator = function(operator) {
  return this._operators[operator];
};

module.exports = BaseOperatorMutation;
