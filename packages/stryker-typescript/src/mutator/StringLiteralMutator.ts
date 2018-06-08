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

  guard(node: ts.Node): node is AllStringLiterals {
    return node.kind === ts.SyntaxKind.StringLiteral
      || node.kind === ts.SyntaxKind.TemplateExpression
      || node.kind === ts.SyntaxKind.FirstTemplateToken;
  }

  private isInvalidParent(parent: ts.Node): boolean {
    return parent.kind === ts.SyntaxKind.ImportDeclaration ||
      parent.kind === ts.SyntaxKind.LastTypeNode ||
      parent.kind === ts.SyntaxKind.JsxAttribute ||
      parent.kind === ts.SyntaxKind.ExpressionStatement;
  }

  protected identifyReplacements(str: AllStringLiterals, sourceFile: ts.SourceFile): NodeReplacement[] {
    if (str.parent && this.isInvalidParent(str.parent)) {
      return [];
    }

    if (
      // Check for empty strings first.
      (str.kind === ts.SyntaxKind.StringLiteral && str.text === '')
      // Only check for the Token form of template literals. It's impossible to have a TemplateExpression
      // that is empty as it's only used when there is a value embedded. I haven't found a case where the
      // cast fails but the worst that can happen is it is undefined and we fall through to the wrong statement.
      || (str.kind === ts.SyntaxKind.FirstTemplateToken && (str as ts.Node & { text: string }).text === '')
    ) {
      return [{ node: str, replacement: '"Stryker was here!"' }];
    }
    else {
      return [{ node: str, replacement: '""' }];
    }
  }

}
