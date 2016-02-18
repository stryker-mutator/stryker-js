'use strict';

var util = require('util');
import BaseOperatorMutation from './BaseOperatorMutation';

export default class ConditionalBoundayMutation extends BaseOperatorMutation {

  constructor() {
    super('ConditionalBoundary', ['BinaryExpression'], {
      '<': '<=',
      '<=': '<',
      '>': '>=',
      '>=': '>'
    });
  }

}