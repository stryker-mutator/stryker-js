import {Syntax} from 'esprima';
import OperatorMutator from './OperatorMutator';
import MutatorFactory from '../MutatorFactory';

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

MutatorFactory.instance().register('ConditionalBoundary', ConditionalBoundayMutator);