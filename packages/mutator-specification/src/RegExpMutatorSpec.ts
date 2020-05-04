import { expect } from 'chai';

import ExpectMutation from './ExpectMutation';

export default function RegExpMutatorSpec(name: string, expectMutation: ExpectMutation) {
  describe('RegExpMutator', () => {
    it('should have name "RegExp"', () => {
      expect(name).eq('RegExp');
    });

    it('should mutate each filled RegExp literal as an empty regex', () => {
      expectMutation('/hello/g', "new RegExp('')");
      expectMutation('/$^/', "new RegExp('')");
    });

    it('should mutate filled RegExp constructor calls as empty arrays', () => {
      expectMutation('new RegExp(a, b)', "new RegExp('')");
      expectMutation("new RegExp('val')", "new RegExp('')");
      expectMutation("RegExp('val')", "new RegExp('')");
      expectMutation('RegExp(a, b)', "new RegExp('')");
    });

    it('should mutate empty array constructor call as a filled array', () => {
      expectMutation('new RegExp()', '/Hello from Stryker/');
      expectMutation('RegExp()', '/Hello from Stryker/');
    });

    it('should not mutate other function call expressions', () => {
      expectMutation('window.RegExp(21, 2)');
      expectMutation('window["RegExp"](21, 2)');
    });
  });
}
