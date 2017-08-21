import { Mutant } from 'stryker-api/mutant';
import * as ts from 'typescript';

export default abstract class Mutator<T extends ts.Node = ts.Node> {
  abstract name: string;
  abstract guard(node: ts.Node): node is T;
  abstract mutate(node: T, sourceFile: ts.SourceFile): Mutant[];

  createMutant(original: ts.Node, sourceFile: ts.SourceFile, replacement: string): Mutant {
    return {
      mutatorName: this.name,
      replacement,
      fileName: sourceFile.fileName,
      range: [original.getStart(sourceFile), original.getEnd()]
    };
  }
}  