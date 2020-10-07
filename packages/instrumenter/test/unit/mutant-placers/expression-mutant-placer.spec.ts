import { expect } from 'chai';
import { types, NodePath } from '@babel/core';
import { normalizeWhitespaces } from '@stryker-mutator/util';
import generate from '@babel/generator';

import { expressionMutantPlacer } from '../../../src/mutant-placers/expression-mutant-placer';
import { findNodePath, parseJS } from '../../helpers/syntax-test-helpers';
import { Mutant } from '../../../src/mutant';
import { createMutant } from '../../helpers/factories';

describe(expressionMutantPlacer.name, () => {
  it('should have the correct name', () => {
    expect(expressionMutantPlacer.name).eq('expressionMutantPlacer');
  });

  it('should not place when the parent is tagged template expression', () => {
    // A templateLiteral is considered an expression, while it is not save to place a mutant there!
    const templateLiteral = findNodePath(parseJS('html`<p></p>`'), (p) => p.isTemplateLiteral());
    expect(expressionMutantPlacer(templateLiteral, [])).false;
  });

  function arrangeSingleMutant() {
    const ast = parseJS('const foo = a + b');
    const binaryExpression = findNodePath(ast, (p) => p.isBinaryExpression());
    const mutant = new Mutant(1, 'file.js', {
      original: binaryExpression.node,
      replacement: types.binaryExpression('>>>', types.identifier('bar'), types.identifier('baz')),
      mutatorName: 'fooMutator',
    });
    return { binaryExpression, mutant, ast };
  }

  it('should be able to place a mutant on an expression', () => {
    // Arrange
    const { binaryExpression, mutant, ast } = arrangeSingleMutant();

    // Act
    const actual = expressionMutantPlacer(binaryExpression, [mutant]);
    const actualCode = normalizeWhitespaces(generate(ast).code);

    // Assert
    expect(actual).true;
    expect(actualCode).contains('const foo = stryMutAct_9fa48(1) ? bar >>> baz');
  });

  it('should place the original code as the alternative', () => {
    const { binaryExpression, mutant, ast } = arrangeSingleMutant();
    expressionMutantPlacer(binaryExpression, [mutant]);
    const actualAlternative = findNodePath<types.ConditionalExpression>(ast, (p) => p.isConditionalExpression()).node.alternate;
    const actualAlternativeCode = generate(actualAlternative).code;
    expect(actualAlternativeCode.endsWith('a + b'), `${actualAlternativeCode} did not end with "a + b"`).true;
  });

  it('should add mutant coverage syntax', () => {
    const { binaryExpression, mutant, ast } = arrangeSingleMutant();
    expressionMutantPlacer(binaryExpression, [mutant]);
    const actualAlternative = findNodePath<types.ConditionalExpression>(ast, (p) => p.isConditionalExpression()).node.alternate;
    const actualAlternativeCode = generate(actualAlternative).code;
    const expected = 'stryCov_9fa48(1), a + b';
    expect(actualAlternativeCode.startsWith(expected), `${actualAlternativeCode} did not start with "${expected}"`).true;
  });

  it('should be able to place multiple mutants', () => {
    // Arrange
    const ast = parseJS('const foo = a + b');
    const binaryExpression = findNodePath(ast, (p) => p.isBinaryExpression());
    const mutants = [
      createMutant({
        id: 52,
        original: binaryExpression.node,
        replacement: types.binaryExpression('-', types.identifier('bar'), types.identifier('baz')),
      }),
      createMutant({
        id: 659,
        original: binaryExpression.node,
        replacement: types.identifier('bar'),
      }),
    ];

    // Act
    expressionMutantPlacer(binaryExpression, mutants);
    const actualCode = normalizeWhitespaces(generate(ast).code);

    // Assert
    expect(actualCode).contains('const foo = stryMutAct_9fa48(659) ? bar : stryMutAct_9fa48(52) ? bar - baz');
  });

  describe('object literals', () => {
    it('should not place when the expression is a key', () => {
      // A stringLiteral is considered an expression, while it is not save to place a mutant there!
      const stringLiteral = findNodePath(parseJS("const foo = { 'foo': bar }"), (p) => p.isStringLiteral());
      expect(expressionMutantPlacer(stringLiteral, [])).false;
    });

    it('should place when the expression is the value', () => {
      // A stringLiteral is considered an expression, while it is not save to place a mutant there!
      const stringLiteral = findNodePath(parseJS("const foo = { 'foo': bar }"), (p) => p.isIdentifier() && p.node.name === 'bar');
      expect(expressionMutantPlacer(stringLiteral, [])).true;
    });
  });

  /**
   * This describe has tests for anonymous classes and functions.
   * @see https://github.com/stryker-mutator/stryker/issues/2362
   */
  describe('anonymous expressions', () => {
    function arrangeActAssert(ast: types.File, expression: NodePath, expectedMatch: RegExp) {
      const mutants = [
        createMutant({
          id: 4,
          original: expression.node,
          replacement: types.identifier('bar'),
        }),
      ];

      // Act
      expressionMutantPlacer(expression, mutants);
      const actualCode = normalizeWhitespaces(generate(ast).code);

      // Assert
      expect(actualCode).matches(expectedMatch);
    }

    it('should set the name of an anonymous function expression', () => {
      // Arrange
      const ast = parseJS('const foo = function () { }');
      const functionExpression = findNodePath(ast, (p) => p.isFunctionExpression());
      arrangeActAssert(ast, functionExpression, /const foo =.*function foo\(\) {}/);
    });

    it('should set the name of an anonymous method expression', () => {
      // Arrange
      const ast = parseJS('const foo = { bar: function () { } }');
      const functionExpression = findNodePath(ast, (p) => p.isFunctionExpression());
      arrangeActAssert(ast, functionExpression, /const foo =.*bar:.*function bar\(\) {}/);
    });

    it('should not set the name if the statement is not a variable declaration', () => {
      // Arrange
      const ast = parseJS('foo.bar = function () { }');
      const functionExpression = findNodePath(ast, (p) => p.isFunctionExpression());
      arrangeActAssert(ast, functionExpression, /foo\.bar =.*function \(\) {}/);
    });

    it('should not set the name of a named function expression', () => {
      // Arrange
      const ast = parseJS('const foo = function bar () { }');
      const functionExpression = findNodePath(ast, (p) => p.isFunctionExpression());
      arrangeActAssert(ast, functionExpression, /const foo =.*function bar\(\) {}/);
    });

    it('should set the name of an anonymous class expression', () => {
      // Arrange
      const ast = parseJS('const Foo = class { }');
      const classExpression = findNodePath(ast, (p) => p.isClassExpression());
      arrangeActAssert(ast, classExpression, /const Foo =.*class Foo {}/);
    });

    it('should not override the name of a named class expression', () => {
      // Arrange
      const ast = parseJS('const Foo = class Bar { }');
      const classExpression = findNodePath(ast, (p) => p.isClassExpression());
      arrangeActAssert(ast, classExpression, /const Foo =.*class Bar {}/);
    });

    it('should set the name of an anonymous arrow function', () => {
      // Arrange
      const ast = parseJS('const bar = () => {}');
      const functionExpression = findNodePath(ast, (p) => p.isArrowFunctionExpression());
      arrangeActAssert(ast, functionExpression, /const bar =.*\(\(\) => { const bar = \(\) => {}; return bar; }\)\(\)/);
    });
  });
});
