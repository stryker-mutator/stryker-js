'use strict';

var util = require('util');
import BaseOperatorMutation from './BaseOperatorMutation';

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
