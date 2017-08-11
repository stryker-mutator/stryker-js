import * as ts from 'typescript';
import Mutator from '../Mutator';
import { copyNode } from '../utils/utilCreator';

export default class BinaryExpressionMutator extends Mutator {

  replaceTokens: { [n: number]: ts.BinaryOperator[] } = {
    [ts.SyntaxKind.PlusToken]: [ts.SyntaxKind.MinusToken],
    [ts.SyntaxKind.MinusToken]: [ts.SyntaxKind.PlusToken],
    [ts.SyntaxKind.SlashToken]: [ts.SyntaxKind.AsteriskToken],
    [ts.SyntaxKind.AsteriskToken]: [ts.SyntaxKind.SlashToken],
    [ts.SyntaxKind.PercentToken]: [ts.SyntaxKind.AsteriskToken],
    [ts.SyntaxKind.LessThanToken]: [ts.SyntaxKind.LessThanEqualsToken, ts.SyntaxKind.GreaterThanEqualsToken],
    [ts.SyntaxKind.LessThanEqualsToken]: [ts.SyntaxKind.LessThanToken, ts.SyntaxKind.GreaterThanToken],
    [ts.SyntaxKind.GreaterThanToken]: [ts.SyntaxKind.LessThanEqualsToken, ts.SyntaxKind.GreaterThanEqualsToken],
    [ts.SyntaxKind.GreaterThanEqualsToken]: [ts.SyntaxKind.LessThanToken, ts.SyntaxKind.GreaterThanToken],
    [ts.SyntaxKind.EqualsEqualsToken]: [ts.SyntaxKind.ExclamationEqualsToken],
    [ts.SyntaxKind.ExclamationEqualsToken]: [ts.SyntaxKind.EqualsEqualsToken],
    [ts.SyntaxKind.EqualsEqualsEqualsToken]: [ts.SyntaxKind.ExclamationEqualsEqualsToken],
    [ts.SyntaxKind.ExclamationEqualsEqualsToken]: [ts.SyntaxKind.EqualsEqualsEqualsToken],
  };

  public syntaxTargets: ts.SyntaxKind[] = [ts.SyntaxKind.BinaryExpression];

  protected mutate(node: ts.Node): ts.Node[] {
    const binaryExpression = (<ts.BinaryExpression>node);
    return this.replaceTokens[binaryExpression.operatorToken.kind].map(replacement => {
      const node = copyNode(binaryExpression);
      node.operatorToken.kind = replacement;
      return node;
    });
  }
  name: string = 'BinaryExpressionMutator';

}