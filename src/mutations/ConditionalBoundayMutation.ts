'use strict';

var util = require('util');
var BaseOperatorMutation = require('./BaseOperatorMutation.js');

function ConditionalBoundayMutation() {
  BaseOperatorMutation.call(
    this,
    'ConditionalBoundary', ['BinaryExpression'], {
      '<': '<=',
      '<=': '<',
      '>': '>=',
      '>=': '>'
    }
  );
}

util.inherits(ConditionalBoundayMutation, BaseOperatorMutation);

module.exports = ConditionalBoundayMutation;
