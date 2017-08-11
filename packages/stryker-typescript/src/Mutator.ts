import { MutantCandidate } from './MutantCandidate';
import * as ts from 'typescript';
import { createLocation, createRange } from './utils/utilCreator';

abstract class Mutator {

  /**
   * @param name The name of the Mutator which may be used by reporters.
   */
  public abstract readonly name: string;

  public abstract syntaxTargets: ts.SyntaxKind[];

  /**
   * Applies mutant to specific node of AST. Return
   * @param fileName: name of file that the mutant is in.
   * @param originalCode: the original code.
   * @param node: typescript Node object. Needed for it's index for location.
   * @param sourceFile: SourceFile object of the .ts file that is begin mutated. Needed for it's index/location.
   * @returns MutantCandidate: A mutated version of the code.
   */
  public applyMutation(fileName: string, originalCode: string, node: ts.Node, sourceFile: ts.SourceFile): MutantCandidate[] {
    if (this.syntaxTargets.indexOf(node.kind) !== -1) {
      return this.mutate(node).map(mutatedNode => new MutantCandidate(
        this.name,
        fileName,
        node.getFullText(),
        mutatedNode.getFullText(),
        createLocation(node, sourceFile),
        createRange(node, sourceFile)));
    }
    else {
      return [];
    }
  }

  protected abstract mutate(node: ts.Node): ts.Node[];
}

export default Mutator;