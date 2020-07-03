import { types } from '@babel/core';

import { Mutant as MutantApi } from '@stryker-mutator/api/core';

import { expect } from 'chai';

import { Mutant } from '../../src/mutant';
import { parseJS, findNodePath } from '../helpers/syntax-test-helpers';

describe(Mutant.name, () => {
  describe('constructor', () => {
    it('should print the replacement code (so it cannot change later)', () => {
      // Since babel ASTs are mutable, and we ARE mutating the ast, the code will change.
      // We need to make sure that we print the mutated code before that can happen.
      // Arrange
      const original = types.binaryExpression('+', types.numericLiteral(40), types.numericLiteral(2));
      const replacement = types.binaryExpression('-', types.numericLiteral(40), types.numericLiteral(2));
      const mutant = new Mutant(2, original, replacement, 'file.js', 'fooMutator');

      // Act
      replacement.operator = '%';

      // Assert
      expect(mutant.replacementCode).eq('40 - 2');
    });
  });

  describe(Mutant.prototype.toApiMutant.name, () => {
    it('should map all properties as expected', () => {
      const mutant = new Mutant(2, types.stringLiteral(''), types.stringLiteral('Stryker was here!'), 'file.js', 'fooMutator');
      mutant.original.loc = { start: { column: 0, line: 0 }, end: { column: 0, line: 0 } };
      const expected: Partial<MutantApi> = {
        fileName: 'file.js',
        id: 2,
        mutatorName: 'fooMutator',
        replacement: '"Stryker was here!"',
      };
      expect(mutant.toApiMutant()).deep.include(expected);
    });

    it('should offset location correctly', () => {
      // Arrange
      const lt = findNodePath<types.BinaryExpression>(parseJS('if(a < b) { console.log("hello world"); }'), (p) => p.isBinaryExpression()).node;
      const lte = types.binaryExpression('<=', lt.left, lt.right);
      const mutant = new Mutant(1, lt, lte, 'bar.js', 'barMutator');

      // Act
      const actual = mutant.toApiMutant();

      // Assert
      expect(actual.location).deep.eq({ start: { line: 0, column: 3 }, end: { line: 0, column: 8 } });
      expect(actual.range).deep.eq([3, 8]);
    });
  });
});
