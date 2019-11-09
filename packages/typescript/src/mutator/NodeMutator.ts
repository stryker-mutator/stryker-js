import { Mutant } from '@stryker-mutator/api/mutant';
import * as path from 'path';
import * as ts from 'typescript';

export interface NodeReplacement {
  node: ts.Node;
  replacement: string;
}

export default abstract class NodeMutator<T extends ts.Node = ts.Node> {
  public abstract name: string;
  public abstract guard(node: ts.Node): node is T;

  public mutate(node: T, sourceFile: ts.SourceFile): Mutant[] {
    return this.identifyReplacements(node, sourceFile).map(replacement => this.createMutant(replacement.node, replacement.replacement, sourceFile));
  }

  protected abstract identifyReplacements(node: T, sourceFile: ts.SourceFile): NodeReplacement[];

  private createMutant(original: ts.Node, replacement: string, sourceFile: ts.SourceFile): Mutant {
    return {
      fileName: sourceFile.fileName.replace(/\//g, path.sep),
      mutatorName: this.name,
      range: [original.getStart(sourceFile), original.getEnd()],
      replacement
    };
  }
}
