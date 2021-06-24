import { NodePath, types } from '@babel/core';

import { NodeMutator } from './node-mutator';

enum ArithmeticOperators {
  '+' = '-',
  '-' = '+',
  '*' = '/',
  '/' = '*',
  '%' = '*',
}

export class ArithmeticOperatorMutator implements NodeMutator {
  public name = 'ArithmeticOperator';

  public *mutate(path: NodePath): Iterable<types.Node> {
    if (path.isBinaryExpression() && this.isSupported(path.node.operator, path.node)) {
      const mutatedOperator = ArithmeticOperators[path.node.operator];
      const replacement = types.cloneNode(path.node, false);
      replacement.operator = mutatedOperator;
      yield replacement;
    }
  }

  private isSupported(operator: string, node: types.BinaryExpression): operator is keyof typeof ArithmeticOperators {
    if (!Object.keys(ArithmeticOperators).includes(operator)) {
      return false;
    }

    const stringTypes = ['StringLiteral', 'TemplateLiteral'];
    const leftType = node.left.type === 'BinaryExpression' ? node.left.right.type : node.left.type;

    if (stringTypes.includes(node.right.type) || stringTypes.includes(leftType)) {
      return false;
    }

    return true;
  }
}
