import { expect } from 'chai';
import babel from '@babel/core';

import { Position } from '@stryker-mutator/api/core';

import { MutantCollector } from '../../../src/transformers/mutant-collector.js';
import { createMutant } from '../../helpers/factories.js';

const { types } = babel;

describe(MutantCollector.name, () => {
  let sut: MutantCollector;

  beforeEach(() => {
    sut = new MutantCollector();
  });

  it('should have 0 mutants', () => {
    expect(sut.mutants).lengthOf(0);
  });

  describe(MutantCollector.prototype.collect.name, () => {
    it('should add the mutant to the list with a unique id', () => {
      const fileName = 'file.js';
      const original = types.identifier('bar');
      const replacement = types.identifier('foo');
      sut.collect(fileName, original, { mutatorName: 'fooMutator', replacement });
      expect(sut.mutants).deep.eq([
        createMutant({
          fileName,
          id: '0',
          original,
          replacement,
        }),
      ]);
    });

    it('should choose a unique id if it is the second mutant', () => {
      const fileName = 'file.js';
      const original = types.identifier('bar');
      const replacement = types.identifier('baz');
      sut.collect(fileName, original, { mutatorName: 'fooMutator', replacement: types.identifier('foo') });
      sut.collect(fileName, original, { mutatorName: 'fooMutator', replacement });
      expect(sut.mutants).lengthOf(2);
      expect(sut.mutants[1]).deep.eq(
        createMutant({
          fileName,
          id: '1',
          original,
          replacement,
        }),
      );
    });

    it('should create mutant with offset info', () => {
      const fileName = 'file.js';
      const original = types.identifier('foo');
      const replacement = types.identifier('bar');
      const expectedOffset: Position = { line: 4, column: 42 };

      sut.collect(fileName, original, { replacement, mutatorName: 'mutatorName' }, expectedOffset);

      expect(sut.mutants[0].offset).eq(expectedOffset);
    });
  });

  describe(MutantCollector.prototype.hasPlacedMutants.name, () => {
    it('should return true when a mutant is placed for the file', () => {
      const input = [createMutant({ fileName: 'foo.js' }), createMutant({ fileName: 'bar.js' })];
      input.map((mutant) => sut.collect(mutant.fileName, mutant.original, mutant));
      expect(sut.hasPlacedMutants('foo.js')).true;
      expect(sut.hasPlacedMutants('bar.js')).true;
    });

    it('should return false when no mutants is registered for the file', () => {
      const input = [createMutant({ fileName: 'foo.js' }), createMutant({ fileName: 'bar.js' })];
      input.map((mutant) => sut.collect(mutant.fileName, mutant.original, mutant));
      expect(sut.hasPlacedMutants('baz.js')).false;
    });

    it('should return false when there are ignored mutants only', () => {
      const input = createMutant({ fileName: 'foo.js', ignoreReason: 'foo is ignored' });
      sut.collect(input.fileName, input.original, input);
      expect(sut.hasPlacedMutants('foo.js')).false;
    });

    it('should return false when no mutants are registered at all', () => {
      expect(sut.hasPlacedMutants('baz.js')).false;
    });
  });
});
