import * as _ from 'lodash';
import BlockStatementMutator from './mutators/BlockStatementMutator';
import ConditionalBoundaryMutator from './mutators/ConditionalBoundaryMutator';
import MathMutator from './mutators/MathMutator';
import RemoveConditionalsMutator from './mutators/RemoveConditionalsMutator';
import ReverseConditionalMutator from './mutators/ReverseConditionalMutator';
import UnaryOperatorMutator from './mutators/UnaryOperatorMutator';
import {Mutator, StrykerNode, MutatorFactory} from './api/mutant';
import * as fileUtils from './utils/fileUtils';
import Mutant from './Mutant';
import * as parserUtils from './utils/parserUtils';
import * as log4js from 'log4js';

const log = log4js.getLogger('Mutator');

/**
 * Class capable of finding spots to mutate in files.
 */
export default class MutatorOrchestrator {
  private mutators: Mutator[];

  public constructor() {
    this.registerDefaultMutators();
    this.mutators = [];
    let mutatorFactory = MutatorFactory.instance();
    mutatorFactory.knownNames().forEach((name) => {
      this.mutators.push(mutatorFactory.create(name, null));
    });
  }

  /**
   * Mutates source files. Mutated code is not writen to disk.
   * @function
   * @param sourceFiles - The list of files which should be mutated.
   * @returns {Mutant[]} The generated Mutants.
   */
  generateMutants(sourceFiles: string[]) {
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
            log.info(`Skipping file ${err.path} because it does not exist`);
            break;
          default:
            console.log(err);
            throw err;
        }
      }
    });

    return mutants;
  };
  
  private registerDefaultMutators(){
    let mutatorFactory = MutatorFactory.instance();
    mutatorFactory.register('BlockStatement', BlockStatementMutator);
    mutatorFactory.register('ConditionalBoundary', ConditionalBoundaryMutator);
    mutatorFactory.register('Math', MathMutator);
    mutatorFactory.register('RemoveConditionals', RemoveConditionalsMutator);
    mutatorFactory.register('ReverseConditional', ReverseConditionalMutator);
    mutatorFactory.register('UnaryOperator', UnaryOperatorMutator);
  }

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
          try {
            mutator.applyMutations(astnode, _.cloneDeep).forEach((mutatedNode: ESTree.Node) => {
              let mutatedCode = parserUtils.generate(mutatedNode);
              let originalNode = nodes[(<StrykerNode>mutatedNode).nodeID];
              mutants.push(new Mutant(mutator, sourceFile, originalCode, mutatedCode, originalNode.loc));
            })
          } catch (error) {
            throw new Error(`The mutator named '${mutator.name}' caused an error: ${error}`);
          }

        });
      }
    });

    return mutants;
  };
}