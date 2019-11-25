import { expect } from 'chai';

import ExpectMutation from './ExpectMutation';

export default function ArrayLiteralMutatorSpec(name: string, expectMutation: ExpectMutation) {
  describe('ArrayLiteralMutator', () => {
    beforeEach(() => {
      console.warn('DEPRECATED: please migrate from the ArrayLiteralMutatorSpec to the ArrayDeclarationMutatorSpec');
    });

    it('should have name "ArrayLiteral"', () => {
      expect(name).eq('ArrayLiteral');
    });

    it('should mutate filled array literals as empty arrays', () => {
      expectMutation('[a, 1 + 1]', '[]', 'xxx');
      expectMutation("['val']", '[]', 'xxx');
    });

    it('should not mutate array initializers (leave that for ArrayNewExpressionMutator)', () => {
      expectMutation('new Array()');
      expectMutation('new Array(1, 2, 3)');
    });

    it('should mutate empty array literals as a filled array', () => {
      expectMutation('[]', "['Stryker was here'], 'xxx'");
    });
  });
}
