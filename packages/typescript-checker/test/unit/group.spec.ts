import { factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { SourceFiles } from '../../src/compilers/compiler';

import { createGroups } from '../../src/group';

describe('group', () => {
  describe('creating-group', () => {
    it('no-mutants-should-give-no-groups', () => {
      const result = createGroups(new Map(), []);
      expect(result).empty;
    });

    it('depending-files-should-return-two-groups', () => {
      const groups: SourceFiles = new Map([
        ['a.ts', {
          fileName: 'a.ts',
          importedBy: new Set(),
          imports: new Set(['b.ts']),
        }],
        ['b.ts', {
          fileName: 'b.ts',
          importedBy: new Set(['a.ts']),
          imports: new Set(),
        }]
      ]);

      const result = createGroups(groups, [
        factory.mutantTestCoverage({ id: '1', fileName: 'a.ts' }),
        factory.mutantTestCoverage({ id: '2', fileName: 'b.ts' }),
      ]);

      expect(result).to.have.lengthOf(2);
    });

    it('non-depending-files-should-return-one-group', () => {
      const groups: SourceFiles = new Map([
        ['a.ts', {
          fileName: 'a.ts',
          importedBy: new Set(),
          imports: new Set(['b.ts', 'c.ts']),
        }],
        ['b.ts', {
          fileName: 'b.ts',
          importedBy: new Set(['a.ts']),
          imports: new Set(),
        }],
        ['c.ts', {
          fileName: 'c.ts',
          importedBy: new Set(['a.ts']),
          imports: new Set(),
        }],
      ]);

      const result = createGroups(groups, [
        factory.mutantTestCoverage({ id: '2', fileName: 'b.ts' }),
        factory.mutantTestCoverage({ id: '3', fileName: 'c.ts' }),
      ]);

      expect(result).to.have.lengthOf(1);
    });

    it('group should be divided if mutants have same dependencies', () => {
      const groups: SourceFiles = new Map([
        ['a.ts', {
          fileName: 'a.ts',
          importedBy: new Set(),
          imports: new Set(['b.ts', 'd.ts']),
        }],
        ['b.ts', {
          fileName: 'b.ts',
          importedBy: new Set(['a.ts']),
          imports: new Set('c.ts'),
        }],
        ['c.ts', {
          fileName: 'c.ts',
          importedBy: new Set(['b.ts']),
          imports: new Set(),
        }],
        ['d.ts', {
          fileName: 'c.ts',
          importedBy: new Set(['a.ts']),
          imports: new Set(),
        }],
      ]);

      const result = createGroups(groups, [
        factory.mutantTestCoverage({ id: '5', fileName: 'd.ts' }),
        factory.mutantTestCoverage({ id: '4', fileName: 'c.ts' }),
        factory.mutantTestCoverage({ id: '3', fileName: 'b.ts' }),
      ]);

      expect(result).to.have.lengthOf(2);
    });
  });
});
