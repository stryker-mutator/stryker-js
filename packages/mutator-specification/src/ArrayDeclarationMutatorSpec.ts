import { expect } from 'chai';

import ExpectMutation from './ExpectMutation';

export default function ArrayDeclarationMutatorSpec(name: string, expectMutation: ExpectMutation) {
  describe('ArrayDeclarationMutator', () => {
    it('should have name "ArrayDeclaration"', () => {
      expect(name).eq('ArrayDeclaration');
    });

    it('should mutate filled array literals as empty arrays', () => {
      expectMutation('[a, 1 + 1]', '[]');
      expectMutation("['val']", '[]');
    });

    it('should mutate empty array literals as a filled array', () => {
      expectMutation('[]', '["Stryker was here"]');
    });

    it('should mutate filled Array constructor calls as empty arrays', () => {
      expectMutation('new Array(a, 1 + 1)', 'new Array()');
      expectMutation("new Array('val')", 'new Array()');
      expectMutation("Array('val')", 'Array()');
      expectMutation('Array(a, 1 + 1)', 'Array()');
    });

    it('should not mutate other new expressions', () => {
      expectMutation('new Object(21, 2)');
      expectMutation('new Arrays(21, 2)');
    });

    it('should mutate empty array constructor call as a filled array', () => {
      expectMutation('new Array()', 'new Array([])');
      expectMutation('Array()', 'Array([])');
    });

    it('should not mutate other function call expressions', () => {
      expectMutation('window.Array(21, 2)');
      expectMutation('window["Array"](21, 2)');
    });
  });
}
