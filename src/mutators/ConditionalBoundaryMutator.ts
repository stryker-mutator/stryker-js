import {Syntax} from 'esprima';
import OperatorMutator from './OperatorMutator';

export default class ConditionalBoundayMutator extends OperatorMutator {

  constructor() {
    super('ConditionalBoundary', [Syntax.BinaryExpression], {
      '<': '<=',
      '<=': '<',
      '>': '>=',
      '>=': '>'
    });
  }

}