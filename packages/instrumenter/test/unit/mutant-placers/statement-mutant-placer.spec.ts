import { expect } from 'chai';
import { types } from '@babel/core';
import generate from '@babel/generator';
import { normalizeWhitespaces } from '@stryker-mutator/util';

import { statementMutantPlacer } from '../../../src/mutant-placers/statement-mutant-placer';
import { findNodePath, parseJS } from '../../helpers/syntax-test-helpers';
import { Mutant } from '../../../src/mutant';
import { createMutant } from '../../helpers/factories';

describe(statementMutantPlacer.name, () => {
  it('should have the correct name', () => {
    expect(statementMutantPlacer.name).eq('statementMutantPlacer');
  });

  it("shouldn't place mutants on anything but a statement", () => {
    [
      findNodePath(parseJS('foo + bar'), (p) => p.isBinaryExpression()),
      findNodePath(parseJS('foo = bar'), (p) => p.isAssignmentExpression()),
      findNodePath(parseJS('foo.bar()'), (p) => p.isCallExpression()),
    ].forEach((node) => {
      expect(statementMutantPlacer(node, [])).false;
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
    const actual = statementMutantPlacer(statement, [mutant]);
    const actualCode = normalizeWhitespaces(generate(ast).code);

    // Assert
    expect(actual).true;
    expect(actualCode).contains(normalizeWhitespaces('if (stryMutAct_9fa48(1)) { const foo = bar >>> baz; } else '));
  });

  it('should keep block statements in tact', () => {
    // Arrange
    const ast = parseJS('function add(a, b) { return a + b; }');
    const statement = findNodePath(ast, (p) => p.isBlockStatement());
    const originalNodePath = findNodePath<types.BinaryExpression>(ast, (p) => p.isBinaryExpression());
    const mutant = createMutant({
      original: originalNodePath.node,
      replacement: types.binaryExpression('>>>', types.identifier('a'), types.identifier('b')),
    });

    // Act
    const actual = statementMutantPlacer(statement, [mutant]);
    const actualCode = normalizeWhitespaces(generate(ast).code);

    // Assert
    expect(actual).true;
    expect(actualCode).matches(/function\s*add\s*\(a,\s*b\)\s*{.*}/);
  });

  it('should place the original code as alternative (inside `else`)', () => {
    const { ast, mutant, statement } = arrangeSingleMutant();
    statementMutantPlacer(statement, [mutant]);
    const actualCode = normalizeWhitespaces(generate(ast).code);
    expect(actualCode).matches(/else\s*{.*const foo = a \+ b;\s*\}/);
  });

  it('should add mutant coverage syntax', () => {
    const { ast, mutant, statement } = arrangeSingleMutant();
    statementMutantPlacer(statement, [mutant]);
    const actualCode = normalizeWhitespaces(generate(ast).code);
    expect(actualCode).matches(/else\s*{\s*stryCov_9fa48\(1\)/);
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
    statementMutantPlacer(statement, mutants);
    const actualCode = normalizeWhitespaces(generate(ast).code);

    // Assert
    expect(actualCode).contains(
      normalizeWhitespaces(`if (stryMutAct_9fa48(659)) {
          const bar = a + b;
        } else if (stryMutAct_9fa48(52)) {
          const foo = bar >>> baz;
        } else {
          stryCov_9fa48(52, 659)`)
    );
  });
});
