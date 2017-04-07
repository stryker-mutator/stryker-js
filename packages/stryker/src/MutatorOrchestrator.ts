import BinaryOperatorMutator from './mutators/BinaryOperatorMutator';
import BlockStatementMutator from './mutators/BlockStatementMutator';
import LogicalOperatorMutator from './mutators/LogicalOperatorMutator';
import RemoveConditionalsMutator from './mutators/RemoveConditionalsMutator';
import UnaryOperatorMutator from './mutators/UnaryOperatorMutator';
import UpdateOperatorMutator from './mutators/UpdateOperatorMutator';
import ArrayDeclaratorMutator from './mutators/ArrayDeclaratorMutator';
import { Mutator, MutatorFactory } from 'stryker-api/mutant';
import { SourceFile } from 'stryker-api/report';
import * as fileUtils from './utils/fileUtils';
import Mutant from './Mutant';
import * as parserUtils from './utils/parserUtils';
import * as log4js from 'log4js';
import { freezeRecursively, copy } from './utils/objectUtils';
import * as estree from 'estree';
import StrictReporter from './reporters/StrictReporter';
const log = log4js.getLogger('Mutator');

/**
 * Class capable of finding spots to mutate in files.
 */
export default class MutatorOrchestrator {
  private mutators: Mutator[] = [];
  private sourceFiles: SourceFile[];

  /**
   * @param reporter - The reporter to report read input files to
   */
  public constructor(private reporter: StrictReporter) {
    this.registerDefaultMutators();
    let mutatorFactory = MutatorFactory.instance();
    mutatorFactory.knownNames().forEach((name) => this.mutators.push(mutatorFactory.create(name, undefined)));
  }

  /**
   * Mutates source files. Mutated code is not writen to disk.
   * @function
   * @param sourceFiles - The list of files which should be mutated.
   * @returns {Mutant[]} The generated Mutants.
   */
  generateMutants(sourceFiles: string[]) {
    let mutants: Mutant[] = [];
    this.sourceFiles = [];
    sourceFiles.forEach((sourceFile: string) => {
      try {
        let fileContent = fileUtils.readFile(sourceFile);
        this.reportFileRead(sourceFile, fileContent);
        let abstractSyntaxTree = parserUtils.parse(fileContent);
        let nodes = new parserUtils.NodeIdentifier().identifyAndFreeze(abstractSyntaxTree);
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
    this.reportAllFilesRead();

    return mutants;
  };

  private reportFileRead(path: string, content: string) {
    let fileToReport = { path, content };
    freezeRecursively(fileToReport);
    this.sourceFiles.push(fileToReport);
    this.reporter.onSourceFileRead(fileToReport);
  }

  private reportAllFilesRead() {
    freezeRecursively(this.sourceFiles);
    this.reporter.onAllSourceFilesRead(this.sourceFiles);
  }

  private registerDefaultMutators() {
    let mutatorFactory = MutatorFactory.instance();
    mutatorFactory.register('BinaryOperator', BinaryOperatorMutator);
    mutatorFactory.register('BlockStatement', BlockStatementMutator);
    mutatorFactory.register('LogicalOperator', LogicalOperatorMutator);
    mutatorFactory.register('RemoveConditionals', RemoveConditionalsMutator);
    mutatorFactory.register('UnaryOperator', UnaryOperatorMutator);
    mutatorFactory.register('UpdateOperator', UpdateOperatorMutator);
    mutatorFactory.register('ArrayDeclarator', ArrayDeclaratorMutator);
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
  private findMutants(sourceFile: string, originalCode: string, ast: estree.Program, nodes: any[]) {
    let mutants: Mutant[] = [];
    nodes.forEach((astnode) => {
      if (astnode.type) {
        Object.freeze(astnode);
        this.mutators.forEach((mutator: Mutator) => {
          try {
            let mutatedNodes = mutator.applyMutations(astnode, copy);

            if (mutatedNodes) {
              if (!Array.isArray(mutatedNodes)) {
                mutatedNodes = [mutatedNodes];
              }

              if (mutatedNodes.length > 0) {
                log.debug(`The mutator '${mutator.name}' mutated ${mutatedNodes.length} node${mutatedNodes.length > 1 ? 's' : ''} between (Ln ${astnode.loc.start.line}, Col ${astnode.loc.start.column}) and (Ln ${astnode.loc.end.line}, Col ${astnode.loc.end.column}) in file ${sourceFile}`);
              }

              mutatedNodes.forEach(mutatedNode => {
                let mutatedCode = parserUtils.generate(mutatedNode);
                let originalNode = nodes[mutatedNode.nodeID];
                mutants.push(new Mutant(mutator.name, sourceFile, originalCode, mutatedCode, originalNode.loc, originalNode.range));
              });
            }

          } catch (error) {
            throw new Error(`The mutator named '${mutator.name}' caused an error: ${error}`);
          }

        });
      }
    });

    return mutants;
  };
}