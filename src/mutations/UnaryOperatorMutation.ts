'use strict';

var util = require('util');
import BaseOperatorMutation from './BaseOperatorMutation';

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
