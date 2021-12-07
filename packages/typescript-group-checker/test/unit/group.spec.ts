import { Mutant } from '@stryker-mutator/api/core';
import { factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { DependencyGraph } from '../../src/graph/dependency-graph';
import { createGroups } from '../../src/group';

describe('group', () => {
  describe('creating-group', () => {
    it('no-mutants-should-give-no-groups', () => {
      const result = createGroups(new DependencyGraph([]), []);
      expect(result).empty;
    });

    it('depending-files-should-return-two-groups', () => {
      const result = createGroups(
        new DependencyGraph([
          { fileName: 'a.ts', imports: new Set(['b.ts']) },
          { fileName: 'b.ts', imports: new Set() },
        ]),
        [factory.mutant({ id: '1', fileName: 'a.ts' }), factory.mutant({ id: '2', fileName: 'b.ts' })]
      );

      expect(result).to.have.lengthOf(2);
    });

    it('non-depending-files-should-return-one-group', () => {
      const result = createGroups(
        new DependencyGraph([
          { fileName: 'a.ts', imports: new Set(['b.ts', 'c.ts']) },
          { fileName: 'b.ts', imports: new Set() },
          { fileName: 'c.ts', imports: new Set() },
        ]),
        [factory.mutant({ id: '2', fileName: 'b.ts' }), factory.mutant({ id: '3', fileName: 'c.ts' })]
      );

      expect(result).to.have.lengthOf(1);
    });

    it('group should be divided if mutants have same dependencies', () => {
      const result = createGroups(
        new DependencyGraph([
          { fileName: 'a.ts', imports: new Set(['b.ts', 'd.ts']) },
          { fileName: 'b.ts', imports: new Set(['c.ts']) },
          { fileName: 'c.ts', imports: new Set([]) },
          { fileName: 'd.ts', imports: new Set([]) },
        ]),
        [factory.mutant({ id: '5', fileName: 'd.ts' }), factory.mutant({ id: '4', fileName: 'c.ts' }), factory.mutant({ id: '3', fileName: 'b.ts' })]
      );

      expect(result).to.have.lengthOf(2);
    });
  });
});
