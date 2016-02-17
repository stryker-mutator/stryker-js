'use strict';

var util = require('util');
var BaseOperatorMutation = require('./BaseOperatorMutation.js');

function UnaryOperatorMutation() {
  BaseOperatorMutation.call(
    this,
    'Unary operator', ['UpdateExpression', 'UnaryExpression'], {
      '++': '--',
      '--': '++',
      '-': '+',
      '+': '-'
    }
  );
}

util.inherits(UnaryOperatorMutation, BaseOperatorMutation);

module.exports = UnaryOperatorMutation;
