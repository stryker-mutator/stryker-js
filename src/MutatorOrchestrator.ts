import {Mutator} from './api/mutant';
import * as fileUtils from './utils/fileUtils';
import Mutant from './Mutant';
import MutatorRegistry from './MutatorRegistry';
import * as parserUtils from './utils/parserUtils';

/**
 * Class capable of finding spots to mutate in files.
 */
export default class MutatorOrchestrator {
  private mutators: Mutator[];

  public constructor() {
    this.mutators = MutatorRegistry.mutators;
  }

  /**
   * Mutates source files. Mutated code is not writen to disk.
   * @function
   * @param sourceFiles - The list of files which should be mutated.
   * @returns {Mutant[]} The generated Mutants.
   */
  mutate(sourceFiles: string[]) {
    let mutants: Mutant[] = [];

    sourceFiles.forEach((sourceFile: string) => {
      try {
        let fileContent = fileUtils.readFile(sourceFile);
        let abstractSyntaxTree = parserUtils.parse(fileContent);
        let nodes = parserUtils.getNodesWithType(abstractSyntaxTree);
        let newMutants = this.findMutants(sourceFile, fileContent, abstractSyntaxTree, nodes);
        mutants = mutants.concat(newMutants);
      } catch (err) {
        switch (err.code) {
          case 'ENOENT':
            console.log(`Skipping file ${err.path} because it does not exist`);
            break;
          default:
            console.log(err);
            throw err;
        }
      }
    });

    return mutants;
  };

  /**
   * Finds all mutants for a given set of nodes.
   * @function
   * @param {String} sourceFile - The name source file.
   * @param {String} originalCode - The original content of the file which has not been mutated.
   * @param {Object} ast - The original abstract syntax tree which is used for reference when generating code.
   * @param {AbstractSyntaxTreeNode[]} nodes - The nodes which could be used by mutations to generate mutants.
   * @returns {Mutant[]} All possible Mutants for the given set of nodes.
   */
  private findMutants(sourceFile: string, originalCode: string, ast: ESTree.Program, nodes: any[]) {
    let mutants: Mutant[] = [];
    nodes.forEach((astnode) => {
      if (astnode.type) {
        Object.freeze(astnode);
        this.mutators.forEach((mutator: Mutator) => {
          mutator.applyMutations(astnode).forEach((mutatedNode: ESTree.Node) => {
            let mutatedCode = parserUtils.generate(mutatedNode);
            mutants.push(new Mutant(mutator, sourceFile, originalCode, mutatedCode, astnode.loc));
          })
        });
      }
    });

    return mutants;
  };
}