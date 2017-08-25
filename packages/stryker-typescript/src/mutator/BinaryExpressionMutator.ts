import * as ts from 'typescript';
import { Mutant } from 'stryker-api/mutant';
import Mutator from './Mutator';

const replaceTokens = {
  [ts.SyntaxKind.PlusToken]: ['-'],
  [ts.SyntaxKind.MinusToken]: ['+'],
  [ts.SyntaxKind.SlashToken]: ['*'],
  [ts.SyntaxKind.AsteriskToken]: ['/'],
  [ts.SyntaxKind.PercentToken]: ['*'],
  [ts.SyntaxKind.LessThanToken]: ['<=', '>='],
  [ts.SyntaxKind.LessThanEqualsToken]: ['<', '>'],
  [ts.SyntaxKind.GreaterThanToken]: ['<=', '>='],
  [ts.SyntaxKind.GreaterThanEqualsToken]: ['<', '>'],
  [ts.SyntaxKind.EqualsEqualsToken]: ['!='],
  [ts.SyntaxKind.ExclamationEqualsToken]: ['=='],
  [ts.SyntaxKind.EqualsEqualsEqualsToken]: ['!=='],
  [ts.SyntaxKind.ExclamationEqualsEqualsToken]: ['==='],
};

export default class BinaryExpressionMutator extends Mutator<ts.BinaryExpression> {

  name: string = 'BinaryExpressionMutator';

  public guard(node: ts.Node): node is ts.BinaryExpression {
    return node.kind === ts.SyntaxKind.BinaryExpression;
  }

  public mutate(node: ts.BinaryExpression): Mutant[] {
    if (replaceTokens[node.operatorToken.kind]) {
      return replaceTokens[node.operatorToken.kind]
        .map(replacement => this.createMutant(node.operatorToken, replacement));
    } else {
      return [];
    }
  }
}