import { expect } from 'chai';
import babel from '@babel/core';
import generator from '@babel/generator';
import { normalizeWhitespaces } from '@stryker-mutator/util';

import { statementMutantPlacer } from '../../../src/mutant-placers/statement-mutant-placer.js';
import { findNodePath, parseJS } from '../../helpers/syntax-test-helpers.js';
import { Mutant } from '../../../src/mutant.js';
import { createMutant } from '../../helpers/factories.js';

// @ts-expect-error CJS typings not in line with synthetic esm
const generate: typeof generator = generator.default;
const { types } = babel;

describe('statementMutantPlacer', () => {
  it('should have the correct name', () => {
    expect(statementMutantPlacer.name).eq('statementMutantPlacer');
  });

  describe(statementMutantPlacer.canPlace.name, () => {
    it('should be false for anything but a statement', () => {
      [
        findNodePath(parseJS('foo + bar'), (p) => p.isBinaryExpression()),
        findNodePath(parseJS('foo = bar'), (p) => p.isAssignmentExpression()),
        findNodePath(parseJS('foo.bar()'), (p) => p.isCallExpression()),
      ].forEach((node) => {
        expect(statementMutantPlacer.canPlace(node)).false;
      });
    });

    it('should be able to place a mutant in a statement', () => {
      // Arrange
      const ast = parseJS('const foo = a + b');
      const statement = findNodePath(ast, (p) => p.isVariableDeclaration());

      // Act
      const actual = statementMutantPlacer.canPlace(statement);

      // Assert
      expect(actual).true;
    });
  });

  describe(statementMutantPlacer.place.name, () => {
    function arrangeSingleMutant() {
      const ast = parseJS('const foo = a + b');
      const statement = findNodePath<babel.types.VariableDeclaration>(ast, (p) => p.isVariableDeclaration());
      const nodeToMutate = findNodePath<babel.types.BinaryExpression>(ast, (p) => p.isBinaryExpression());
      const mutant = new Mutant('1', 'file.js', nodeToMutate.node, {
        replacement: types.binaryExpression('>>>', types.identifier('bar'), types.identifier('baz')),
        mutatorName: 'fooMutator',
      });
      const appliedMutants = new Map([[mutant, mutant.applied(statement.node)]]);
      return { statement, appliedMutants, ast };
    }

    it('should be able to place a mutant in a statement', () => {
      // Arrange
      const { statement, appliedMutants, ast } = arrangeSingleMutant();

      // Act
      statementMutantPlacer.place(statement, appliedMutants);
      const actualCode = normalizeWhitespaces(generate(ast).code);

      // Assert
      expect(actualCode).contains(normalizeWhitespaces('if (stryMutAct_9fa48("1")) { const foo = bar >>> baz; } else '));
    });

    it('should keep block statements in tact', () => {
      // Arrange
      const ast = parseJS('function add(a, b) { return a + b; }');
      const statement = findNodePath<babel.types.BlockStatement>(ast, (p) => p.isBlockStatement());
      const originalNodePath = findNodePath<babel.types.BinaryExpression>(ast, (p) => p.isBinaryExpression());
      const mutant = createMutant({
        original: originalNodePath.node,
        replacement: types.binaryExpression('>>>', types.identifier('a'), types.identifier('b')),
      });
      const appliedMutants = new Map([[mutant, mutant.applied(statement.node)]]);

      // Act
      statementMutantPlacer.place(statement, appliedMutants);
      const actualCode = normalizeWhitespaces(generate(ast).code);

      // Assert
      expect(actualCode).matches(/function\s*add\s*\(a,\s*b\)\s*{.*}/);
    });

    it('should place the original code as alternative (inside `else`)', () => {
      const { ast, appliedMutants, statement } = arrangeSingleMutant();
      statementMutantPlacer.place(statement, appliedMutants);
      const actualCode = normalizeWhitespaces(generate(ast).code);
      expect(actualCode).matches(/else\s*{.*const foo = a \+ b;\s*\}/);
    });

    it('should add mutant coverage syntax', () => {
      const { ast, appliedMutants, statement } = arrangeSingleMutant();
      statementMutantPlacer.place(statement, appliedMutants);
      const actualCode = normalizeWhitespaces(generate(ast).code);
      expect(actualCode).matches(/else\s*{\s*stryCov_9fa48\("1"\)/);
    });

    it('should be able to place multiple mutants', () => {
      // Arrange
      const ast = parseJS('const foo = a + b');
      const statement = findNodePath<babel.types.VariableDeclaration>(ast, (p) => p.isVariableDeclaration());
      const binaryExpression = findNodePath<babel.types.BinaryExpression>(ast, (p) => p.isBinaryExpression());
      const fooIdentifier = findNodePath<babel.types.Identifier>(ast, (p) => p.isIdentifier());
      const mutants = [
        new Mutant('52', 'file.js', binaryExpression.node, {
          replacement: types.binaryExpression('>>>', types.identifier('bar'), types.identifier('baz')),
          mutatorName: 'fooMutator',
        }),
        new Mutant('659', 'file.js', fooIdentifier.node, {
          replacement: types.identifier('bar'),
          mutatorName: 'fooMutator',
        }),
      ];
      const appliedMutants = new Map<Mutant, babel.types.Statement>();
      appliedMutants.set(mutants[0], mutants[0].applied(statement.node));
      appliedMutants.set(mutants[1], mutants[1].applied(statement.node));

      // Act
      statementMutantPlacer.place(statement, appliedMutants);
      const actualCode = normalizeWhitespaces(generate(ast).code);

      // Assert
      expect(actualCode).contains(
        normalizeWhitespaces(`if (stryMutAct_9fa48("659")) {
          const bar = a + b;
        } else if (stryMutAct_9fa48("52")) {
          const foo = bar >>> baz;
        } else {
          stryCov_9fa48("52", "659")`)
      );
    });
  });
});
