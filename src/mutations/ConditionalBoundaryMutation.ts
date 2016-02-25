'use strict';

import {Syntax} from 'esprima';
import BaseOperatorMutation from './BaseOperatorMutation';

export default class ConditionalBoundayMutation extends BaseOperatorMutation {

  constructor() {
    super('ConditionalBoundary', [Syntax.BinaryExpression], {
      '<': '<=',
      '<=': '<',
      '>': '>=',
      '>=': '>'
    });
  }

}