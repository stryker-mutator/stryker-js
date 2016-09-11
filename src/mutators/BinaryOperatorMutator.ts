import {Mutator} from 'stryker-api/mutant';
import {Syntax} from 'esprima';
import * as estree from 'stryker-api/estree';

export default class BinaryOperatorMutator implements Mutator  {
  name = 'BinaryOperator';
  private type = Syntax.BinaryExpression;
  private operators: { [targetedOperator: string]: estree.BinaryOperator | estree.BinaryOperator[] } = {
      '+': '-',
      '-': '+',
      '*': '/',
      '/': '*',
      '%': '*',
      '<': ['<=', '>='],
      '<=': ['<', '>'],
      '>': ['>=', '<='],
      '>=': ['>', '<'],
      '==': '!=',
      '!=': '==',
      '===': '!==',
      '!==': '==='
    };

  applyMutations(node: estree.Node, copy: (obj: any, deep?: boolean) => any): estree.Node[] {
    let nodes: estree.Node[] = [];

    if (node.type === Syntax.BinaryExpression && this.operators[(<estree.BinaryExpression>node).operator]) {
      let mutatedOperators = this.operators[(<estree.BinaryExpression>node).operator];
      if(typeof mutatedOperators === "string"){
        mutatedOperators = [mutatedOperators];
      }
      
      mutatedOperators.forEach(operator => {
        let mutatedNode: estree.BinaryExpression = copy(node);
        mutatedNode.operator = operator;
        nodes.push(mutatedNode);
        
      });
    }

    return nodes;
  }

}