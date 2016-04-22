'use strict';

import * as _ from 'lodash';
import BaseMutation from './mutations/BaseMutation';
import * as fileUtils from './utils/fileUtils';
import Mutant from './Mutant';
import MutationRegistry from './MutationRegistry';
import * as parserUtils from './utils/parserUtils';
import * as log4js from 'log4js';

const log = log4js.getLogger('Mutator');

/**
 * Class capable of finding spots to mutate in files.
 */
export default class Mutator {
  private mutationRegistry = new MutationRegistry();
  private mutations: BaseMutation[];

  public constructor() {
    this.mutations = this.mutationRegistry.getAllMutations();
  }

  /**
   * Mutates source files. Mutated code is not writen to disk.
   * @function
   * @param sourceFiles - The list of files which should be mutated.
   * @returns {Mutant[]} The generated Mutants.
   */
  mutate(sourceFiles: string[]) {
    var mutants: Mutant[] = [];
    var types = _.uniq(_.flatten(_.map(this.mutations, function(mutation: BaseMutation) {
      return mutation.types;
    })));

    _.forEach(sourceFiles, (sourceFile: string) => {
      try {
        var fileContent = fileUtils.readFile(sourceFile);
        var abstractSyntaxTree = parserUtils.parse(fileContent);
        var nodes = parserUtils.getNodesWithType(abstractSyntaxTree, types);
        var newMutants = this.findMutants(sourceFile, fileContent, abstractSyntaxTree, nodes);
        mutants = mutants.concat(newMutants);
      } catch (err) {
        switch (err.code) {
          case 'ENOENT':
            log.info(`Skipping file ${err.path} because it does not exist`);
            break;
          default:
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
    var mutants: Mutant[] = [];
    _.forEach(nodes, (astnode, index) => {
      if (astnode.type) {
        _.forEach(this.mutations, (mutation: BaseMutation) => {
          if (mutation.canMutate(astnode)) {
            mutants = mutants.concat(mutation.applyMutation(sourceFile, originalCode, astnode, ast));
          }
        });
      }
    });

    return mutants;
  };
}