'use strict';

var util = require('util');
import BaseOperatorMutation from './BaseOperatorMutation';

export default class UnaryOperatorMutation extends BaseOperatorMutation {
  constructor() {
    super('Unary operator', ['UpdateExpression', 'UnaryExpression'], {
        '++': '--',
        '--': '++',
        '-': '+',
        '+': '-'});
  }
}
