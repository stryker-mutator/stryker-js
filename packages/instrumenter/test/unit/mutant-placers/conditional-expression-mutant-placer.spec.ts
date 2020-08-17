import { expect } from 'chai';
import { types, NodePath } from '@babel/core';
import { normalizeWhitespaces } from '@stryker-mutator/util';
import generate from '@babel/generator';

import { conditionalExpressionMutantPlacer } from '../../../src/mutant-placers/conditional-expression-mutant-placer';
import { findNodePath, parseJS } from '../../helpers/syntax-test-helpers';
import { Mutant } from '../../../src/mutant';
import { createMutant } from '../../helpers/factories';

describe(conditionalExpressionMutantPlacer.name, () => {
  it('should have the correct name', () => {
    expect(conditionalExpressionMutantPlacer.name).eq('conditionalExpressionMutantPlacer');
  });

  it('should not place when the parent is tagged template expression', () => {
    // A templateLiteral is considered an expression, while it is not save to place a mutant there!
    const templateLiteral = findNodePath(parseJS('html`<p></p>`'), (p) => p.isTemplateLiteral());
    expect(conditionalExpressionMutantPlacer(templateLiteral, [])).false;
  });

  function arrangeSingleMutant() {
    const ast = parseJS('const foo = a + b');
    const binaryExpression = findNodePath(ast, (p) => p.isBinaryExpression());
    const mutant = new Mutant(
      1,
      binaryExpression.node,
      types.binaryExpression('>>>', types.identifier('bar'), types.identifier('baz')),
      'file.js',
      'fooMutator'
    );
    return { binaryExpression, mutant, ast };
  }

  it('should be able to place a mutant on an expression', () => {
    // Arrange
    const { binaryExpression, mutant, ast } = arrangeSingleMutant();

    // Act
    const actual = conditionalExpressionMutantPlacer(binaryExpression, [mutant]);
    const actualCode = normalizeWhitespaces(generate(ast).code);

    // Assert
    expect(actual).true;
    expect(actualCode).contains('const foo = __global_69fa48.__activeMutant__ === 1 ? bar >>> baz');
  });

  it('should place the original code as the alternative', () => {
    const { binaryExpression, mutant, ast } = arrangeSingleMutant();
    conditionalExpressionMutantPlacer(binaryExpression, [mutant]);
    const actualAlternative = findNodePath<types.ConditionalExpression>(ast, (p) => p.isConditionalExpression()).node.alternate;
    const actualAlternativeCode = generate(actualAlternative).code;
    expect(actualAlternativeCode.endsWith('a + b'), `${actualAlternativeCode} did not end with "a + b"`).true;
  });

  it('should add mutant coverage syntax', () => {
    const { binaryExpression, mutant, ast } = arrangeSingleMutant();
    conditionalExpressionMutantPlacer(binaryExpression, [mutant]);
    const actualAlternative = findNodePath<types.ConditionalExpression>(ast, (p) => p.isConditionalExpression()).node.alternate;
    const actualAlternativeCode = generate(actualAlternative).code;
    const expected = '__global_69fa48.__coverMutant__(1), ';
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
    conditionalExpressionMutantPlacer(binaryExpression, mutants);
    const actualCode = normalizeWhitespaces(generate(ast).code);

    // Assert
    expect(actualCode).contains('const foo = __global_69fa48.__activeMutant__ === 659 ? bar : __global_69fa48.__activeMutant__ === 52 ? bar - baz');
  });

  describe('object literals', () => {
    it('should not place when the expression is a key', () => {
      // A stringLiteral is considered an expression, while it is not save to place a mutant there!
      const stringLiteral = findNodePath(parseJS("const foo = { 'foo': bar }"), (p) => p.isStringLiteral());
      expect(conditionalExpressionMutantPlacer(stringLiteral, [])).false;
    });

    it('should place when the expression is the value', () => {
      // A stringLiteral is considered an expression, while it is not save to place a mutant there!
      const stringLiteral = findNodePath(parseJS("const foo = { 'foo': bar }"), (p) => p.isIdentifier() && p.node.name === 'bar');
      expect(conditionalExpressionMutantPlacer(stringLiteral, [])).true;
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
      conditionalExpressionMutantPlacer(expression, mutants);
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
