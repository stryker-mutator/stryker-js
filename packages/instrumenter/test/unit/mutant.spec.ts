import babel from '@babel/core';
import generator from '@babel/generator';
import { Mutant as MutantApi } from '@stryker-mutator/api/core';
import { expect } from 'chai';

import { Mutant } from '../../src/mutant.js';
import { createJSAst, createSourceLocation } from '../helpers/factories.js';
import { parseJS, findNodePath } from '../helpers/syntax-test-helpers.js';

const { types } = babel;

const generate = generator.default;

describe(Mutant.name, () => {
  describe('constructor', () => {
    it('should print the replacement code (so it cannot change later)', () => {
      // Arrange
      const original = types.binaryExpression('+', types.numericLiteral(40), types.numericLiteral(2));
      const replacement = types.binaryExpression('-', types.numericLiteral(40), types.numericLiteral(2));
      const mutant = new Mutant('2', 'file.js', original, { replacement, mutatorName: 'fooMutator' });

      // Act
      replacement.operator = '%';

      // Assert
      expect(mutant.replacementCode).eq('40 - 2');
    });
  });

  describe(Mutant.prototype.toApiMutant.name, () => {
    it('should map all properties as expected for an ignored mutant', () => {
      const mutant = new Mutant('2', 'file.js', types.stringLiteral(''), {
        replacement: types.stringLiteral('Stryker was here!'),
        mutatorName: 'fooMutator',
        ignoreReason: 'ignore',
      });
      mutant.original.loc = createSourceLocation();
      const expected: Partial<MutantApi> = {
        fileName: 'file.js',
        id: '2',
        mutatorName: 'fooMutator',
        replacement: '"Stryker was here!"',
        statusReason: 'ignore',
        status: 'Ignored',
      };
      expect(mutant.toApiMutant()).deep.include(expected);
    });

    it('should map all properties as expected for a placed mutant', () => {
      const mutant = new Mutant('2', 'file.js', types.stringLiteral(''), {
        replacement: types.stringLiteral('Stryker was here!'),
        mutatorName: 'fooMutator',
      });
      mutant.original.loc = createSourceLocation();
      const expected: Partial<MutantApi> = {
        fileName: 'file.js',
        id: '2',
        mutatorName: 'fooMutator',
        replacement: '"Stryker was here!"',
        statusReason: undefined,
        status: undefined,
      };
      expect(mutant.toApiMutant()).deep.include(expected);
    });

    it('should offset location line correctly', () => {
      // Arrange
      const lt = findNodePath<babel.types.BinaryExpression>(parseJS('if(a < b) { console.log("hello world"); }'), (p) => p.isBinaryExpression()).node;
      const lte = types.binaryExpression('<=', lt.left, lt.right);
      const mutant = new Mutant('1', 'bar.js', lt, { replacement: lte, mutatorName: 'barMutator' }, { column: 0, line: 4 });

      // Act
      const actual = mutant.toApiMutant();

      // Assert
      expect(actual.location).deep.eq({ start: { line: 4, column: 3 }, end: { line: 4, column: 8 } });
    });

    it('should offset location columns when line = 0 (current line) correctly', () => {
      // Arrange
      const lt = findNodePath<babel.types.BinaryExpression>(parseJS('if(a < b) { console.log("hello world"); }'), (p) => p.isBinaryExpression()).node;
      const lte = types.binaryExpression('<=', lt.left, lt.right);
      const mutant = new Mutant('1', 'bar.js', lt, { replacement: lte, mutatorName: 'barMutator' }, { column: 42, line: 0 });

      // Act
      const actual = mutant.toApiMutant();

      // Assert
      expect(actual.location).deep.eq({ start: { line: 0, column: 45 }, end: { line: 0, column: 50 } });
    });

    it('should not offset columns when line != 0 (one of the next lines)', () => {
      // Arrange
      const lt = findNodePath<babel.types.BinaryExpression>(parseJS('console.log("skip line 1"); \nif(a < b) { console.log("hello world"); }'), (p) =>
        p.isBinaryExpression(),
      ).node;
      const lte = types.binaryExpression('<=', lt.left, lt.right);
      const mutant = new Mutant('1', 'bar.js', lt, { replacement: lte, mutatorName: 'barMutator' }, { column: 42, line: 0 });

      // Act
      const actual = mutant.toApiMutant();

      // Assert
      expect(actual.location).deep.eq({ start: { line: 1, column: 3 }, end: { line: 1, column: 8 } });
    });
  });

  describe(Mutant.prototype.applied.name, () => {
    it('should just return the replacement node if provided with the original node', () => {
      const original = types.binaryExpression('+', types.numericLiteral(40), types.numericLiteral(2));
      const replacement = types.binaryExpression('-', types.numericLiteral(40), types.numericLiteral(2));
      const mutant = new Mutant('2', 'file.js', original, { replacement, mutatorName: 'fooMutator' });
      expect(mutant.applied(original)).eq(replacement);
    });
    it('should just return a copy of the AST with the mutant in it if provided with a parent', () => {
      // Arrange
      const ast = createJSAst({ rawContent: 'const c = a + b' }).root;
      const parent = findNodePath(ast, (path) => path.isVariableDeclaration()).node;
      const original = findNodePath(ast, (path) => path.isBinaryExpression()).node;
      const replacement = types.binaryExpression('-', types.identifier('a'), types.identifier('b'));
      const mutant = new Mutant('2', 'file.js', original, { replacement, mutatorName: 'fooMutator' });

      // Act
      const appliedMutant = mutant.applied(parent);

      // Assert
      expect(generate(appliedMutant).code).eq('const c = a - b;');
      // original AST should not be mutated
      expect(generate(ast).code).eq('const c = a + b;');
    });
  });
});
