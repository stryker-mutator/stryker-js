'use strict';

var util = require('util');
import BaseOperatorMutation from './BaseOperatorMutation';

function MathMutation() {
  BaseOperatorMutation.call(
    this,
    'Math', ['BinaryExpression'], {
      '+': '-',
      '-': '+',
      '*': '/',
      '/': '*',
      '%': '*'
    }
  );
}

util.inherits(MathMutation, BaseOperatorMutation);

module.exports = MathMutation;
