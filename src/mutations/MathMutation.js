'use strict';

var util = require('util');
var BaseOperatorMutation = require('./BaseOperatorMutation.js');

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
