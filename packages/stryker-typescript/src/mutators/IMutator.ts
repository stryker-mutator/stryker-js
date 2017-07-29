import * as ts from "typescript";
import Mutant from "../Mutant";


interface IMutator {
  /**
   * The name of the Mutator which may be used by reporters.
   */
  name: string;
  // either string[] or dictionary{[number] :string}
  replaceTokens;
  /**
   * Applies mutant to specific node of AST. Return
   * @param fileName: name of file that the mutant is in.
   * @param originalCode: the original code.
   * @param node: typescript Node object. Needed for it's index for location.
   * @param sourceFile: SourceFile object of the .ts file that is begin mutated. Needed for it's index/location.
   * @returns Mutant: A mutated version of the code.
   */
    applyMutation(fileName: string, originalCode: string, node: ts.Node, sourceFile: ts.SourceFile): Mutant[];
}

export default IMutator;