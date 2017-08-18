import MutantCandidate from './MutantCandidate';
import * as ts from 'typescript';

export default abstract class Mutator<T extends ts.Node = ts.Node> {
  abstract name: string;
  abstract guard(node: ts.Node): node is T;
  abstract mutate(node: T, sourceFile: ts.SourceFile): MutantCandidate[];

  createCandidate(original: ts.Node, sourceFile: ts.SourceFile, replacementTypescript: string, replacementJavaScript = replacementTypescript) {
    return new MutantCandidate(this.name, original, sourceFile, replacementTypescript, replacementJavaScript);
  }
}  