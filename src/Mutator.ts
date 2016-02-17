'use strict';

var _ = require('lodash');
var FileUtils = require('./utils/FileUtils');
var MutationRegistry = require('./MutationRegistry');
var ParserUtils = require('./utils/ParserUtils');
var TypeUtils = require('./utils/TypeUtils');
/**
 * Class capable of finding spots to mutate in files.
 * @constructor
 */
var Mutator = function() {
  this._typeUtils = new TypeUtils();
  var mutationRegistry = new MutationRegistry();
  this.mutations = mutationRegistry.getAllMutations();
  this._fileUtils = new FileUtils();
};

/**
 * Mutates source files. Mutated code is not writen to disk.
 * @function
 * @param {String[]} sourceFiles - The list of files which should be mutated.
 * @returns {Mutant[]} The generated Mutants.
 */
Mutator.prototype.mutate = function(sourceFiles) {
  this._typeUtils.expectParameterArray(sourceFiles, 'Mutator', 'sourceFiles');

  var mutants = [];
  var parserUtils = new ParserUtils();
  var types = _.uniq(_.flatten(_.map(this.mutations, function(mutation) {
    return mutation.getTypes();
  })));

  _.forEach(sourceFiles, function(sourceFile) {
    try {
      var fileContent = this._fileUtils.readFile(sourceFile);
      var abstractSyntaxTree = parserUtils.parse(fileContent);
      var nodes = parserUtils.getNodesWithType(abstractSyntaxTree, types);
      var newMutants = this._findMutants(sourceFile, fileContent, abstractSyntaxTree, nodes);
      mutants = mutants.concat(newMutants);
    } catch (err) {
      switch (err.code) {
        case 'ENOENT':
          console.log('Skipping file ' + err.path + ' because it does not exist');
          break;
        default:
          throw err;
      }
    }
  }, this);

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
Mutator.prototype._findMutants = function(sourceFile, originalCode, ast, nodes) {
  this._typeUtils.expectParameterString(sourceFile, 'Mutator', 'sourceFile');
  this._typeUtils.expectParameterString(originalCode, 'Mutator', 'originalCode');
  this._typeUtils.expectParameterObject(ast, 'Mutator', 'ast');
  this._typeUtils.expectParameterArray(nodes, 'Mutator', 'nodes');

  var mutants = [];
  var that = this;
  
  _.forEach(nodes, function(node, index) {
    if (node.getNode().type) {
      _.forEach(that.mutations, function(mutation) {
        if (mutation.canMutate(node.getNode())) {
          mutants = mutants.concat(mutation.applyMutation(sourceFile, originalCode, node.getNode(), ast));
        }
      });
    }
  });

  return mutants;
};

module.exports = Mutator;
