'use strict';

import Mutant from '../Mutant';

abstract class BaseMutation {
    
  /**
   * Represents a base class for all mutations.
   * @class
   * @param {String} name - The name of the mutation.
   * @param {String[]} types - The types of mutation as expected by the parser.
   */
  constructor(protected name: string, protected types: string[]) {
  }

  /**
   * Applies this mutation on the Abstract Syntax Tree and generates one or more Mutants.
   * @function
   * @param {String} filename - The name of the file which will be mutated.
   * @param {String} originalCode - The original content of the file which has not been mutated.
   * @param {Object} node - The part of the abstract syntax tree which has to be mutated.
   * @param {Object} ast - The complete abstract syntax tree.
   * @returns {Mutant[]} The generated Mutants.
   */
  abstract applyMutation(filename: string, originalCode: string, node: ESTree.Node, ast: ESTree.Program): Mutant[];

  /**
   * Checks if this mutation can be applied to the provided node.
   * @function
   * @param {Object} node - A part of the abstract syntax tree.
   * @returns {Boolean} True if the mutation can be applied.
   */
  abstract canMutate(node: ESTree.Node): boolean;

  /**
   * Gets the name of the mutation.
   * @function
   * @returns {String} The name of the mutation.
   */
  getName(): string {
    return this.name;
  }

  /**
   * Gets the types of the mutation.
   * @function
   * @returns {String[]} The types of the mutation.
   */
  getTypes(): string[] {
    return this.types;
  }
}

export default BaseMutation;