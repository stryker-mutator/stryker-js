'use strict';

import Mutant from '../Mutant';

abstract class BaseMutation {
  get name(): string {
    return this._name;
  }
  
  get types(): string[] {
    return this._types;
  }
    
  /**
   * Represents a base class for all mutations.
   * @class
   * @param {String} name - The name of the mutation.
   * @param {String[]} types - The types of mutation as expected by the parser.
   */
  constructor(private _name: string, private _types: string[]) {
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
}

export default BaseMutation;