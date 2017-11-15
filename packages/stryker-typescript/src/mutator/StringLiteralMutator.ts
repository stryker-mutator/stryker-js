import * as ts from 'typescript';
import NodeMutator, { NodeReplacement } from './NodeMutator';

export type AllStringLiterals =
  // Regular quoted string.
  | ts.StringLiteral
  // Templates string with values embedded.
  | ts.TemplateExpression
  // A raw token is emitted if the template string has no embeds.
  | ts.Token<ts.SyntaxKind.FirstTemplateToken>;

export default class StringLiteralMutator extends NodeMutator<AllStringLiterals> {
  name = 'StringLiteral';
  imports: string[] = [];

  guard(node: ts.Node): node is AllStringLiterals {
    return node.kind === ts.SyntaxKind.StringLiteral
      || node.kind === ts.SyntaxKind.TemplateExpression
      || node.kind === ts.SyntaxKind.FirstTemplateToken;
  }

  protected identifyReplacements(str: AllStringLiterals, sourceFile: ts.SourceFile): NodeReplacement[] {
    return [{ node: str, replacement: '""' }];
  }

}
