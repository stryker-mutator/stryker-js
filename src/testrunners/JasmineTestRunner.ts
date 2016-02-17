'use strict';

var _ = require('lodash');
var util = require('util');
var FileUtils = require('../utils/FileUtils');
var KarmaTestRunner = require('./KarmaTestRunner');
var ParserUtils = require('../utils/ParserUtils');
var TestFile = require('../TestFile');

/**
 * Represents a test runner for Jasmine tests using Karma.
 * @constructor
 * @param {Object} config - The configuration for the test runner.
 */
function JasmineTestRunner(config) {
  KarmaTestRunner.call(this, config);

  this._fileUtils = new FileUtils();
  this._parserUtils = new ParserUtils();
  this._config.frameworks = ['jasmine'];
}

util.inherits(JasmineTestRunner, KarmaTestRunner);

JasmineTestRunner.prototype._splitTest = function(testFile) {
  KarmaTestRunner.prototype._splitTest.call(this, testFile);
  var that = this;
  var testFileContent = this._fileUtils.readFile(testFile);
  var ast = this._parserUtils.parse(testFileContent);
  var nodes = this._parserUtils.getNodesWithType(ast, ['ExpressionStatement']);
  var testFiles = [];

  _.forEach(nodes, function(astNode, index) {
    if (astNode.getNode().expression.callee && astNode.getNode().expression.callee.name === 'it') {
      var astNodesLeft = _.dropRight(nodes, nodes.length - index);
      that._removeItsFromParent(astNodesLeft);
      var astNodesRight = _.drop(nodes, index + 1);
      that._removeItsFromParent(astNodesRight);

      var testCode = that._parserUtils.generate(ast);
      var describes = _.filter(astNodesLeft, function(astNode) {
        return astNode.getNode().expression.callee && astNode.getNode().expression.callee.name === 'describe';
      });
      var testFilename = that._generateTestName(astNode, describes);
      testFiles.push(new TestFile(testFilename, testCode));

      _.forEach(nodes, function(expressionStatement, index) {
        if (expressionStatement !== astNode) {
          var parent = expressionStatement.getParent();
          if (that._typeUtils.isObject(parent)) {
            parent[expressionStatement.getKey()] = expressionStatement.getNode();
          } else if (_.indexOf(parent, expressionStatement.getNode()) < 0) {
            parent.splice(expressionStatement.getKey(), 0, expressionStatement.getNode());
          }
        }
      });
    }
  });

  return testFiles;
};

/**
 * Generates the name of a test based on an `it` and a set of describes.
 * @function
 * @param {AbstractSyntaxTreeNode} itNode - The node containing the it statement.
 * @param {AbstractSyntaxTreeNode[]} describeNodes - The describes which may contain the it.
 * @returns {String} The names of all relevant describes and the name of the it.
 */
JasmineTestRunner.prototype._generateTestName = function(itNode, describeNodes) {
  this._typeUtils.expectParameterObject(itNode, '_generateTestName', 'itNode');
  this._typeUtils.expectParameterArray(describeNodes, '_generateTestName', 'describeNodes');

  var that = this;
  var name = '';
  _.forEach(describeNodes, function(describeNode, index) {
    var childNodes = that._parserUtils.getNodesWithType(describeNode.getNode(), ['ExpressionStatement']);
    if (_.find(childNodes, function(childNode) {
        return childNode.getNode() === itNode.getNode();
      })) {
      name += describeNode.getNode().expression.arguments[0].value + ' ';
    }
  });
  name += itNode.getNode().expression.arguments[0].value;

  return name;
};

/**
 * Removes all `it` nodes which are a part of the given nodes from their parent node.
 * @function
 * @param {AbstractSyntaxTreeNode[]} nodes - The nodes which may be `it` nodes which should be removed from their parents.
 */
JasmineTestRunner.prototype._removeItsFromParent = function(nodes) {
  this._typeUtils.expectParameterArray(nodes, '_generateTestName', 'nodes');

  _.forEach(nodes, function(astNode) {
    var node = astNode.getNode();
    var parent = astNode.getParent();

    if (node.expression.callee && node.expression.callee.name === 'it') {
      parent.splice(_.indexOf(parent, node), 1);
    }
  });
};

module.exports = JasmineTestRunner;
