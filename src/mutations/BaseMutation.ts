'use strict';

var TypeUtils = require('../utils/TypeUtils');


export default class BaseMutation {

  _typeUtils;
  _name;
  _types;
    
  /**
   * Represents a base class for all mutations.
   * @class
   * @param {String} name - The name of the mutation.
   * @param {String[]} types - The types of mutation as expected by the parser.
   */
  constructor(name: string, types: string[]) {
    this._typeUtils = new TypeUtils();
    this._typeUtils.expectParameterString(name, 'BaseMutation', 'name');
    this._typeUtils.expectParameterArray(types, 'BaseMutation', 'types');

    this._name = name;
    this._types = types;
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
  applyMutation(filename: string, originalCode: string, node, ast) {
    this._typeUtils.expectParameterString(filename, 'BaseMutation', 'filename');
    this._typeUtils.expectParameterString(originalCode, 'BaseMutation', 'originalCode');
    this._typeUtils.expectParameterObject(node, 'BaseMutation', 'node');
    this._typeUtils.expectParameterObject(ast, 'BaseMutation', 'ast');
    return;
  }

  /**
   * Checks if this mutation can be applied to the provided node.
   * @function
   * @param {Object} node - A part of the abstract syntax tree.
   * @returns {Boolean} True if the mutation can be applied.
   */
  canMutate(node): boolean {
    this._typeUtils.expectParameterObject(node, 'BaseMutation', 'node');
    return false;
  }

  /**
   * Gets the name of the mutation.
   * @function
   * @returns {String} The name of the mutation.
   */
  getName(): string {
    return this._name;
  }

  /**
   * Gets the types of the mutation.
   * @function
   * @returns {String[]} The types of the mutation.
   */
  getTypes(): string[] {
    return this._types;
  }

}
