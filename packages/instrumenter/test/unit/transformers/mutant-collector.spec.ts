import { types } from '@babel/core';
import { expect } from 'chai';

import { MutantCollector } from '../../../src/transformers/mutant-collector';
import { createMutant, createNamedNodeMutation } from '../../helpers/factories';

describe(MutantCollector.name, () => {
  let sut: MutantCollector;

  beforeEach(() => {
    sut = new MutantCollector();
  });

  it('should have 0 mutants', () => {
    expect(sut.mutants).lengthOf(0);
  });

  describe(MutantCollector.prototype.add.name, () => {
    it('should add the mutant to the list with a unique id', () => {
      const fileName = 'file.js';
      const original = types.identifier('bar');
      const replacement = types.identifier('foo');
      sut.add(fileName, { mutatorName: 'fooMutator', replacement, original });
      expect(sut.mutants).deep.eq([
        createMutant({
          fileName,
          id: 0,
          original,
          replacement,
        }),
      ]);
    });

    it('should choose a unique id if it is the second mutant', () => {
      const fileName = 'file.js';
      const original = types.identifier('bar');
      const replacement = types.identifier('baz');
      sut.add(fileName, { mutatorName: 'fooMutator', replacement: types.identifier('foo'), original });
      sut.add(fileName, { mutatorName: 'fooMutator', replacement: replacement, original });
      expect(sut.mutants).lengthOf(2);
      expect(sut.mutants[1]).deep.eq(
        createMutant({
          fileName,
          id: 1,
          original,
          replacement,
        })
      );
    });
  });

  describe(MutantCollector.prototype.findUnplacedMutantsInScope.name, () => {
    it('should return mutants that are in current scope', () => {
      // Arrange
      const input = [createMutant(), createMutant(), createMutant(), createMutant(), createMutant()];
      input[0].original.start = 5;
      input[0].original.end = 6;
      input[1].original.start = 4;
      input[1].original.end = 7;
      input[2].original.start = 3; // not in scope
      input[2].original.end = 8;
      input[3].original.start = 7;
      input[3].original.end = 8; // not in scope
      input[4].original.start = 3; // not in scope
      input[4].original.end = 6;
      const mutants = input.map((mutant) => sut.add(mutant.fileName, mutant));

      // Act
      const actual = sut.findUnplacedMutantsInScope({ start: 4, end: 7 });

      // Assert
      expect(actual).lengthOf(2);
      expect(actual).deep.eq([mutants[0], mutants[1]]);
    });

    it('should return mutants that not have been placed', () => {
      // Arrange
      const input = [createMutant(), createMutant()];
      input[0].original.start = 5;
      input[0].original.end = 6;
      input[1].original.start = 4;
      input[1].original.end = 7;
      const mutants = input.map((mutant) => sut.add(mutant.fileName, mutant));
      sut.markMutantsAsPlaced([mutants[0]]);

      // Act
      const actual = sut.findUnplacedMutantsInScope({ start: 1, end: 99 });

      // Assert
      expect(actual).lengthOf(1);
      expect(actual).deep.eq([mutants[1]]);
    });

    it('should never return ignored mutants', () => {
      // Arrange
      const ignoredMutation = createNamedNodeMutation({ ignoreReason: 'foo should be ignored' });
      const notIgnoredMutation = createNamedNodeMutation();
      ignoredMutation.original.start = 5;
      ignoredMutation.original.end = 6;
      notIgnoredMutation.original.start = 4;
      notIgnoredMutation.original.end = 7;
      sut.add('foo.js', ignoredMutation);
      const expected = sut.add('foo.js', notIgnoredMutation);

      // Act
      const actual = sut.findUnplacedMutantsInScope({ start: 1, end: 99 });

      // Assert
      expect(actual).deep.eq([expected]);
    });
  });

  describe(MutantCollector.prototype.hasPlacedMutants.name, () => {
    it('should return true when a mutant is placed for the file', () => {
      const input = [createMutant({ fileName: 'foo.js' }), createMutant({ fileName: 'bar.js' })];
      const mutants = input.map((mutant) => sut.add(mutant.fileName, mutant));
      sut.markMutantsAsPlaced(mutants);
      expect(sut.hasPlacedMutants('foo.js')).true;
      expect(sut.hasPlacedMutants('bar.js')).true;
    });

    it('should return false when no mutants is registered for the file', () => {
      const input = [createMutant({ fileName: 'foo.js' }), createMutant({ fileName: 'bar.js' })];
      input.map((mutant) => sut.add(mutant.fileName, mutant));
      expect(sut.hasPlacedMutants('baz.js')).false;
    });

    it('should return false when no mutants is placed', () => {
      const input = [createMutant({ fileName: 'foo.js' }), createMutant({ fileName: 'bar.js' })];
      const [, barMutant] = input.map((mutant) => sut.add(mutant.fileName, mutant));
      sut.markMutantsAsPlaced([barMutant]);
      expect(sut.hasPlacedMutants('foo.js')).false;
    });

    it('should return false when there are ignored mutants only', () => {
      const input = createMutant({ fileName: 'foo.js', ignoreReason: 'foo is ignored' });
      sut.add(input.fileName, input);
      expect(sut.hasPlacedMutants('foo.js')).false;
    });

    it('should return false when no mutants are registered at all', () => {
      expect(sut.hasPlacedMutants('baz.js')).false;
    });
  });
});
