'use strict';

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
