import { types } from '@babel/core';

import { Mutant as MutantApi, MutantStatus } from '@stryker-mutator/api/core';
import { location } from '@stryker-mutator/test-helpers/src/factory';

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
      const mutant = new Mutant('2', 'file.js', { original, replacement, mutatorName: 'fooMutator' });

      // Act
      replacement.operator = '%';

      // Assert
      expect(mutant.replacementCode).eq('40 - 2');
    });
  });

  describe(Mutant.prototype.toApiMutant.name, () => {
    it('should map all properties as expected for an ignored mutant', () => {
      const mutant = new Mutant('2', 'file.js', {
        original: types.stringLiteral(''),
        replacement: types.stringLiteral('Stryker was here!'),
        mutatorName: 'fooMutator',
        ignoreReason: 'ignore',
      });
      mutant.original.loc = location();
      const expected: Partial<MutantApi> = {
        fileName: 'file.js',
        id: '2',
        mutatorName: 'fooMutator',
        replacement: '"Stryker was here!"',
        statusReason: 'ignore',
        status: MutantStatus.Ignored,
      };
      expect(mutant.toApiMutant()).deep.include(expected);
    });

    it('should map all properties as expected for a placed mutant', () => {
      const mutant = new Mutant('2', 'file.js', {
        original: types.stringLiteral(''),
        replacement: types.stringLiteral('Stryker was here!'),
        mutatorName: 'fooMutator',
      });
      mutant.original.loc = location();
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

    it('should offset location correctly', () => {
      // Arrange
      const lt = findNodePath<types.BinaryExpression>(parseJS('if(a < b) { console.log("hello world"); }'), (p) => p.isBinaryExpression()).node;
      const lte = types.binaryExpression('<=', lt.left, lt.right);
      const mutant = new Mutant('1', 'bar.js', { original: lt, replacement: lte, mutatorName: 'barMutator' }, 42, 4);

      // Act
      const actual = mutant.toApiMutant();

      // Assert
      expect(actual.location).deep.eq({ start: { line: 4, column: 3 }, end: { line: 4, column: 8 } });
    });
  });
});
