'use strict';

var util = require('util');
var BaseOperatorMutation = require('./BaseOperatorMutation.js');

function ReverseConditionalMutation() {
  BaseOperatorMutation.call(
    this,
    'ReverseConditional', ['BinaryExpression', 'LogicalExpression'], {
      '==': '!=',
      '!=': '==',
      '===': '!==',
      '!==': '===',
      '<=': '>',
      '>=': '<',
      '<': '>=',
      '>': '<=',
      '&&': '||',
      '||': '&&'
    }
  );
}

util.inherits(ReverseConditionalMutation, BaseOperatorMutation);

module.exports = ReverseConditionalMutation;
