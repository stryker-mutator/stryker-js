'use strict';

import * as _ from 'lodash';
import FileUtils from '../utils/FileUtils';
import KarmaTestRunner, {ConfigOptionsIncludingCoverage} from './KarmaTestRunner';
import ParserUtils from '../utils/ParserUtils';
import TestFile from '../TestFile';
import AbstractSyntaxTreeNode from '../AbstractSyntaxTreeNode';

/**
 * Represents a test runner for Jasmine tests using Karma.
 * @constructor
 * @param {Object} config - The configuration for the test runner.
 */
export default class JasmineTestRunner extends KarmaTestRunner {
  
  private _parserUtils = new ParserUtils();

  constructor(config: ConfigOptionsIncludingCoverage) {
    super(config);
    this.karmaConfig.frameworks = ['jasmine'];
  }

  _splitTest(testFile: string) {
    super._splitTest(testFile);
    var testFileContent = this._fileUtils.readFile(testFile);
    var ast = this._parserUtils.parse(testFileContent);
    var nodes = this._parserUtils.getNodesWithType(ast, ['ExpressionStatement']);
    var testFiles: TestFile[] = [];

    _.forEach(nodes, (astNode: any, index: any) => {
      if (astNode.getNode().expression.callee && astNode.getNode().expression.callee.name === 'it') {
        var astNodesLeft = _.dropRight(nodes, nodes.length - index);
        this._removeItsFromParent(astNodesLeft);
        var astNodesRight = _.drop(nodes, index + 1);
        this._removeItsFromParent(astNodesRight);

        var testCode = this._parserUtils.generate(ast);
        var describes = _.filter(astNodesLeft, (astNode: any) => {
          return astNode.getNode().expression.callee && astNode.getNode().expression.callee.name === 'describe';
        });
        var testFilename = this._generateTestName(astNode, describes);
        testFiles.push(new TestFile(testFilename, testCode));

        _.forEach(nodes, (expressionStatement: any, index: any) => {
          if (expressionStatement !== astNode) {
            var parent = expressionStatement.getParent();
            if (this._typeUtils.isObject(parent)) {
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
   * @param itNode - The node containing the it statement.
   * @param describeNodes - The describes which may contain the it.
   * @returns The names of all relevant describes and the name of the it.
   */
  _generateTestName(itNode: any, describeNodes: AbstractSyntaxTreeNode[]) {
    this._typeUtils.expectParameterObject(itNode, '_generateTestName', 'itNode');
    this._typeUtils.expectParameterArray(describeNodes, '_generateTestName', 'describeNodes');

    var name = '';
    _.forEach(describeNodes, (describeNode: any, index: any) => {
      var childNodes = this._parserUtils.getNodesWithType(describeNode.getNode(), ['ExpressionStatement']);
      if (_.find(childNodes, (childNode) => {
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
   * @param nodes - The nodes which may be `it` nodes which should be removed from their parents.
   */
  _removeItsFromParent(nodes: any[]) {
    this._typeUtils.expectParameterArray(nodes, '_generateTestName', 'nodes');

    _.forEach(nodes, astNode => {
      var node = astNode.getNode();
      var parent = astNode.getParent();

      if (node.expression.callee && node.expression.callee.name === 'it') {
        parent.splice(_.indexOf(parent, node), 1);
      }
    });
  }
}
