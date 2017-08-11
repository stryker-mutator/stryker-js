import { SyntaxKind, Node, ConditionalExpression, IfStatement, WhileStatement, DoStatement, ForStatement } from 'typescript';
import Mutator from '../Mutator';
import { copyNode } from '../utils/utilCreator';

export default class RemoveConditionalsMutator extends Mutator {
  public name = 'RemoveConditionalsMutator';

  protected mutate(node: Node): Node[] {
    if (this.isExpressionNode(node)) {
      return this.replaceTokens[node.kind].map(trueFalse => {
        const mutant = copyNode(node);
        mutant.expression.kind = trueFalse;
        return mutant;
      });
    }
    if (this.isConditionNode(node)) {
      this.replaceTokens[node.kind].map(trueFalse => {
        const mutant = copyNode(node);
        if (mutant.condition) {
          mutant.condition.kind = trueFalse;
        }
        return mutant;
      });
    }
    return [];
  }

  private replaceTokens: { [original: number]: (SyntaxKind.TrueKeyword | SyntaxKind.FalseKeyword)[] } = {
    [SyntaxKind.ConditionalExpression]: [SyntaxKind.TrueKeyword, SyntaxKind.FalseKeyword],
    [SyntaxKind.IfStatement]: [SyntaxKind.TrueKeyword, SyntaxKind.FalseKeyword],
    [SyntaxKind.WhileStatement]: [SyntaxKind.FalseKeyword],
    [SyntaxKind.DoStatement]: [SyntaxKind.FalseKeyword],
    [SyntaxKind.ForStatement]: [SyntaxKind.TrueKeyword, SyntaxKind.FalseKeyword]
  };

  public syntaxTargets = Object.keys(this.replaceTokens).map(parseInt) as SyntaxKind[];

  private isExpressionNode(node: Node): node is IfStatement | WhileStatement | DoStatement {
    return node.kind in [SyntaxKind.IfStatement, SyntaxKind.DoStatement, SyntaxKind.WhileStatement];
  }

  private isConditionNode(node: Node): node is ForStatement | ConditionalExpression {
    return node.kind in [SyntaxKind.ConditionalExpression, SyntaxKind.ForStatement];
  }
}