import {Syntax} from 'esprima';
import OperatorMutator from './OperatorMutator';
import {MutatorFactory} from '../api/mutant';

export default class ReverseConditionalMutator extends OperatorMutator {
  constructor(){
    super('ReverseConditional', [Syntax.BinaryExpression, Syntax.LogicalExpression], {
        '==': '!=',
        '!=': '==',
        '===': '!==',
        '!==': '===',
        '<=': '>',
        '>=': '<',
        '<': '>=',
        '>': '<=',
        '&&': '||',
        '||': '&&'}); 
  }
}

MutatorFactory.instance().register('ReverseConditional', ReverseConditionalMutator);