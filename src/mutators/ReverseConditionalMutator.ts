import {Syntax} from 'esprima';
import OperatorMutator from './OperatorMutator';

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
