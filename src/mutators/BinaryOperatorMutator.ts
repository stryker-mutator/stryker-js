import {Mutator} from 'stryker-api/mutant';
import {Syntax} from 'esprima';
import * as estree from 'estree';
import * as _ from 'lodash';

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

  applyMutations(node: estree.Node, copy: <T>(obj: T, deep?: boolean) => T): estree.Node[] {
    let nodes: estree.Node[] = [];

    if (node.type === Syntax.BinaryExpression && this.operators[node.operator]) {
      let mutatedOperators = this.operators[node.operator];
      if(typeof mutatedOperators === "string"){
        mutatedOperators = [mutatedOperators];
      }
      
      mutatedOperators.forEach(operator => {
        let mutatedNode = copy(<estree.BinaryExpression>node);
        mutatedNode.operator = operator;
        nodes.push(mutatedNode);
      });
    }

    return nodes;
  }

}