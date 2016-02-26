'use strict';

import {Syntax} from 'esprima';
import BaseOperatorMutation from './BaseOperatorMutation';

export default class UnaryOperatorMutation extends BaseOperatorMutation {
  constructor() {
    super('Unary operator', [Syntax.UpdateExpression, Syntax.UnaryExpression], {
        '++': '--',
        '--': '++',
        '-': '+',
        '+': '-'});
  }
}
