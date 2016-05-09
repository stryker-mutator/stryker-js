import {Syntax} from 'esprima';
import OperatorMutator from './OperatorMutator';
import {MutatorFactory} from '../api/mutant';

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