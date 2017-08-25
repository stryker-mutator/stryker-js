import { Mutant } from 'stryker-api/mutant';
import * as ts from 'typescript';

export default abstract class Mutator<T extends ts.Node = ts.Node> {
  abstract name: string;
  abstract guard(node: ts.Node): node is T;
  private currentSourceFile: ts.SourceFile;

  generateMutants(node: T, sourceFile: ts.SourceFile): Mutant[] {
    this.currentSourceFile = sourceFile;
    return this.mutate(node);
  }

  protected abstract mutate(node: T): Mutant[];

  createMutant(original: ts.Node, replacement: string): Mutant {
    return {
      mutatorName: this.name,
      replacement,
      fileName: this.currentSourceFile.fileName,
      range: [original.getStart(this.currentSourceFile), original.getEnd()]
    };
  }
}  