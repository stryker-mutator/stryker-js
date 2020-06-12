import { expect } from 'chai';
import { types } from '@babel/core';
import generate from '@babel/generator';
import { normalizeWhitespaces } from '@stryker-mutator/util';

import { switchCaseMutantPlacer } from '../../../src/mutant-placers/switch-case-mutant-placer';
import { findNodePath, parseJS } from '../../helpers/syntax-test-helpers';
import { Mutant } from '../../../src/mutant';

describe(switchCaseMutantPlacer.name, () => {
  it('should have the correct name', () => {
    expect(switchCaseMutantPlacer.name).eq('switchCaseMutantPlacer');
  });

  it("shouldn't place mutants on anything but a statement", () => {
    [
      findNodePath(parseJS('foo + bar'), (p) => p.isBinaryExpression()),
      findNodePath(parseJS('foo = bar'), (p) => p.isAssignmentExpression()),
      findNodePath(parseJS('foo.bar()'), (p) => p.isCallExpression()),
    ].forEach((node) => {
      expect(switchCaseMutantPlacer(node, [])).false;
    });
  });

  function arrangeSingleMutant() {
    const ast = parseJS('const foo = a + b');
    const statement = findNodePath(ast, (p) => p.isVariableDeclaration());
    const nodeToMutate = findNodePath<types.BinaryExpression>(ast, (p) => p.isBinaryExpression());
    const mutant = new Mutant(
      1,
      nodeToMutate.node,
      types.binaryExpression('>>>', types.identifier('bar'), types.identifier('baz')),
      'file.js',
      'fooMutator'
    );
    return { statement, mutant, ast };
  }

  it('should be able to place a mutant in a statement', () => {
    // Arrange
    const { statement, mutant, ast } = arrangeSingleMutant();

    // Act
    const actual = switchCaseMutantPlacer(statement, [mutant]);
    const actualCode = normalizeWhitespaces(generate(ast).code);

    // Assert
    expect(actual).true;
    expect(actualCode).contains(
      normalizeWhitespaces(`{
      switch (__global_69fa48.__activeMutant__) {
        case 1:
          const foo = bar >>> baz;
          break;
          `)
    );
  });

  it('should place the original code as default case', () => {
    const { ast, mutant, statement } = arrangeSingleMutant();
    switchCaseMutantPlacer(statement, [mutant]);
    const actualCode = normalizeWhitespaces(generate(ast).code);
    expect(actualCode).matches(/default:.*const foo = a \+ b;\s*break;/);
  });

  it('should add mutant coverage syntax', () => {
    const { ast, mutant, statement } = arrangeSingleMutant();
    switchCaseMutantPlacer(statement, [mutant]);
    const actualCode = normalizeWhitespaces(generate(ast).code);
    expect(actualCode).matches(/default:\s*__global_69fa48\.__coverMutant__\(1\)/);
  });

  it('should be able to place multiple mutants', () => {
    // Arrange
    const ast = parseJS('const foo = a + b');
    const statement = findNodePath(ast, (p) => p.isVariableDeclaration());
    const binaryExpression = findNodePath<types.BinaryExpression>(ast, (p) => p.isBinaryExpression());
    const fooIdentifier = findNodePath<types.Identifier>(ast, (p) => p.isIdentifier());
    const mutants = [
      new Mutant(52, binaryExpression.node, types.binaryExpression('>>>', types.identifier('bar'), types.identifier('baz')), 'file.js', 'fooMutator'),
      new Mutant(659, fooIdentifier.node, types.identifier('bar'), 'file.js', 'fooMutator'),
    ];

    // Act
    switchCaseMutantPlacer(statement, mutants);
    const actualCode = normalizeWhitespaces(generate(ast).code);

    // Assert
    expect(actualCode).contains(
      normalizeWhitespaces(`{
        switch (__global_69fa48.__activeMutant__) {
          case 52:
            const foo = bar >>> baz;
            break;
          case 659:
            const bar = a + b;
            break;`)
    );
  });
});
