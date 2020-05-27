import { expect } from 'chai';
import { types } from '@babel/core';
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

  it('should not place when the parent is an object literal', () => {
    // A stringLiteral is considered an expression, while it is not save to place a mutant there!
    const stringLiteral = findNodePath(parseJS("const foo = { 'foo': bar }"), (p) => p.isStringLiteral());
    expect(conditionalExpressionMutantPlacer(stringLiteral, [])).false;
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
    expect(actualCode).contains('const foo = __global_69fa48.activeMutant === 1 ? bar >>> baz');
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
    expect(actualCode).contains('const foo = __global_69fa48.activeMutant === 659 ? bar : __global_69fa48.activeMutant === 52 ? bar - baz');
  });
});
