'use strict';

import BaseOperatorMutation from './BaseOperatorMutation';

export default class MathMutation extends BaseOperatorMutation {
  
  constructor () {
   super('Math', ['BinaryExpression'], {
      '+': '-',
      '-': '+',
      '*': '/',
      '/': '*',
      '%': '*'});
  }

}
