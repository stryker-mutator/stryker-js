import * as ts from 'typescript';
import { Mutant } from 'stryker-api/mutant';
import Mutator from './Mutator';

export default class BooleanSubstitutionMutator extends Mutator<ts.BooleanLiteral> {

  name: string = 'BooleanSubstitutionMutator';

  public guard(node: ts.Node): node is ts.BooleanLiteral {
    return node.kind === ts.SyntaxKind.FalseKeyword || node.kind === ts.SyntaxKind.TrueKeyword;
  }

  public mutate(node: ts.BooleanLiteral): Mutant[] {
    if (node.kind === ts.SyntaxKind.FalseKeyword) {
      return [this.createMutant(node, 'true')];
    } else {
      return [this.createMutant(node, 'false')];
    }
  }
}