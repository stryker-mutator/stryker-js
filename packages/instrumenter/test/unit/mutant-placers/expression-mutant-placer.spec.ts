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

  describe(expressionMutantPlacer.canPlace.name, () => {
    it('should be true for an expression', () => {
      // Arrange
      const ast = parseJS('const foo = a + b');
      const binaryExpression = findNodePath(ast, (p) => p.isBinaryExpression());

      // Act
      const actual = expressionMutantPlacer.canPlace(binaryExpression);

      // Assert
      expect(actual).true;
    });

    it('should be false when the parent is tagged template expression', () => {
      // A templateLiteral is considered an expression, while it is not save to place a mutant there!
      const templateLiteral = findNodePath(parseJS('html`<p></p>`'), (p) => p.isTemplateLiteral());
      expect(expressionMutantPlacer.canPlace(templateLiteral)).false;
    });

    describe('object literals', () => {
      it('should be false when the expression is a key', () => {
        // A stringLiteral is considered an expression, while it is not save to place a mutant there!
        const stringLiteral = findNodePath(parseJS("const foo = { 'foo': bar }"), (p) => p.isStringLiteral());
        expect(expressionMutantPlacer.canPlace(stringLiteral)).false;
      });

      it('should be true when the expression is the value', () => {
        // A stringLiteral is considered an expression, while it is not save to place a mutant there!
        const stringLiteral = findNodePath(parseJS("const foo = { 'foo': bar }"), (p) => p.isIdentifier() && p.node.name === 'bar');
        expect(expressionMutantPlacer.canPlace(stringLiteral)).true;
      });
    });

    describe('call expressions', () => {
      it('should be false when expression is an OptionalCallExpression', () => {
        const optionalCallExpression = findNodePath(parseJS('foo?.bar()'), (p) => p.isOptionalCallExpression());
        expect(expressionMutantPlacer.canPlace(optionalCallExpression)).false;
      });
      it('should be false when expression is an OptionalMemberExpression with index accessor', () => {
        const optionalMemberExpression = findNodePath(parseJS('foo?.[1] '), (p) => p.isOptionalMemberExpression());
        expect(expressionMutantPlacer.canPlace(optionalMemberExpression)).false;
      });
      it('should be false when expression is an OptionalMemberExpression', () => {
        const optionalMemberExpression = findNodePath(parseJS('foo?.bar()'), (p) => p.isOptionalMemberExpression());
        expect(expressionMutantPlacer.canPlace(optionalMemberExpression)).false;
      });
    });
  });

  describe(expressionMutantPlacer.place.name, () => {
    it('should be able to place a mutant on an expression', () => {
      // Arrange
      const { binaryExpression, appliedMutants, ast } = arrangeSingleMutant();

      // Act
      expressionMutantPlacer.place(binaryExpression, appliedMutants);
      const actualCode = normalizeWhitespaces(generate(ast).code);

      // Assert
      expect(actualCode).contains('const foo = stryMutAct_9fa48("1") ? bar >>> baz');
    });

    it('should place the original code as the alternative', () => {
      const { binaryExpression, appliedMutants, ast } = arrangeSingleMutant();
      expressionMutantPlacer.place(binaryExpression, appliedMutants);
      const actualAlternative = findNodePath<types.ConditionalExpression>(ast, (p) => p.isConditionalExpression()).node.alternate;
      const actualAlternativeCode = generate(actualAlternative).code;
      expect(actualAlternativeCode.endsWith('a + b'), `${actualAlternativeCode} did not end with "a + b"`).true;
    });

    it('should add mutant coverage syntax', () => {
      const { binaryExpression, appliedMutants, ast } = arrangeSingleMutant();
      expressionMutantPlacer.place(binaryExpression, appliedMutants);
      const actualAlternative = findNodePath<types.ConditionalExpression>(ast, (p) => p.isConditionalExpression()).node.alternate;
      const actualAlternativeCode = generate(actualAlternative).code;
      const expected = 'stryCov_9fa48("1"), a + b';
      expect(actualAlternativeCode.startsWith(expected), `${actualAlternativeCode} did not start with "${expected}"`).true;
    });

    it('should be able to place multiple mutants', () => {
      // Arrange
      const ast = parseJS('const foo = a + b');
      const binaryExpression = findNodePath<types.BinaryExpression>(ast, (p) => p.isBinaryExpression());
      const mutants = [
        createMutant({
          id: '52',
          original: binaryExpression.node,
          replacement: types.binaryExpression('-', types.identifier('bar'), types.identifier('baz')),
        }),
        createMutant({
          id: '659',
          original: binaryExpression.node,
          replacement: types.identifier('bar'),
        }),
      ];
      const appliedMutants = new Map<Mutant, types.BinaryExpression>([
        [mutants[0], mutants[0].applied(binaryExpression.node)],
        [mutants[1], mutants[1].applied(binaryExpression.node)],
      ] as const);

      // Act
      expressionMutantPlacer.place(binaryExpression, appliedMutants);
      const actualCode = normalizeWhitespaces(generate(ast).code);

      // Assert
      expect(actualCode).contains('const foo = stryMutAct_9fa48("659") ? bar : stryMutAct_9fa48("52") ? bar - baz');
    });

    function arrangeSingleMutant() {
      const ast = parseJS('const foo = a + b');
      const binaryExpression = findNodePath<types.BinaryExpression>(ast, (p) => p.isBinaryExpression());
      const mutant = new Mutant('1', 'file.js', binaryExpression.node, {
        replacement: types.binaryExpression('>>>', types.identifier('bar'), types.identifier('baz')),
        mutatorName: 'fooMutator',
      });
      const appliedMutants = new Map([[mutant, mutant.applied(binaryExpression.node)]]);
      return { binaryExpression, appliedMutants, ast };
    }

    /**
     * This describe has tests for anonymous classes and functions.
     * @see https://github.com/stryker-mutator/stryker-js/issues/2362
     */
    describe('anonymous expressions', () => {
      function arrangeActAssert(ast: types.File, expression: NodePath<types.Expression>, expectedMatch: RegExp) {
        const mutant = createMutant({
          id: '4',
          original: expression.node,
          replacement: types.identifier('bar'),
        });
        const appliedMutants = new Map([[mutant, mutant.applied(expression.node)]]);

        // Act
        expressionMutantPlacer.place(expression, appliedMutants);
        const actualCode = normalizeWhitespaces(generate(ast).code);

        // Assert
        expect(actualCode).matches(expectedMatch);
      }

      it('should set the name of an anonymous function expression', () => {
        // Arrange
        const ast = parseJS('const foo = function () { }');
        const functionExpression = findNodePath<types.FunctionExpression>(ast, (p) => p.isFunctionExpression());
        arrangeActAssert(ast, functionExpression, /const foo =.*function foo\(\) {}/);
      });

      it('should set the name of an anonymous method expression', () => {
        // Arrange
        const ast = parseJS('const foo = { bar: function () { } }');
        const functionExpression = findNodePath<types.FunctionExpression>(ast, (p) => p.isFunctionExpression());
        arrangeActAssert(ast, functionExpression, /const foo =.*bar:.*function bar\(\) {}/);
      });

      it('should not set the name if the statement is not a variable declaration', () => {
        // Arrange
        const ast = parseJS('foo.bar = function () { }');
        const functionExpression = findNodePath<types.FunctionExpression>(ast, (p) => p.isFunctionExpression());
        arrangeActAssert(ast, functionExpression, /foo\.bar =.*function \(\) {}/);
      });

      it('should not set the name of a named function expression', () => {
        // Arrange
        const ast = parseJS('const foo = function bar () { }');
        const functionExpression = findNodePath<types.FunctionExpression>(ast, (p) => p.isFunctionExpression());
        arrangeActAssert(ast, functionExpression, /const foo =.*function bar\(\) {}/);
      });

      it('should set the name of an anonymous class expression', () => {
        // Arrange
        const ast = parseJS('const Foo = class { }');
        const classExpression = findNodePath<types.ClassExpression>(ast, (p) => p.isClassExpression());
        arrangeActAssert(ast, classExpression, /const Foo =.*class Foo {}/);
      });

      it('should not override the name of a named class expression', () => {
        // Arrange
        const ast = parseJS('const Foo = class Bar { }');
        const classExpression = findNodePath<types.ClassExpression>(ast, (p) => p.isClassExpression());
        arrangeActAssert(ast, classExpression, /const Foo =.*class Bar {}/);
      });

      it('should set the name of an anonymous arrow function', () => {
        // Arrange
        const ast = parseJS('const bar = () => {}');
        const functionExpression = findNodePath<types.ArrowFunctionExpression>(ast, (p) => p.isArrowFunctionExpression());
        arrangeActAssert(ast, functionExpression, /const bar =.*\(\(\) => { const bar = \(\) => {}; return bar; }\)\(\)/);
      });
    });
  });
});
