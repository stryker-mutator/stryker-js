'use strict';

var util = require('util');
import BaseOperatorMutation from './BaseOperatorMutation';

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
