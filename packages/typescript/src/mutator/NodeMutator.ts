import * as path from 'path';

import { Mutant } from '@stryker-mutator/api/core';
import * as ts from 'typescript';

export interface NodeReplacement {
  node: ts.Node;
  replacement: string;
}

export default abstract class NodeMutator<T extends ts.Node = ts.Node> {
  public abstract name: string;
  public abstract guard(node: ts.Node): node is T;

  public mutate(node: T, sourceFile: ts.SourceFile): Mutant[] {
    return this.identifyReplacements(node, sourceFile).map((replacement) => this.createMutant(replacement.node, replacement.replacement, sourceFile));
  }

  protected abstract identifyReplacements(node: T, sourceFile: ts.SourceFile): NodeReplacement[];

  private createMutant(original: ts.Node, replacement: string, sourceFile: ts.SourceFile): Mutant {
    return {
      id: 42, // TODO this code will be removed in #1514. Temp fill it with a string.
      location: { end: { column: 0, line: 0 }, start: { line: 0, column: 0 } }, // TODO this code will be removed in #1514. Temp fill it now.
      fileName: sourceFile.fileName.replace(/\//g, path.sep),
      mutatorName: this.name,
      range: [original.getStart(sourceFile), original.getEnd()],
      replacement,
    };
  }
}
