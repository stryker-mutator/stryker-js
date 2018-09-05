import { expect } from 'chai';
import ExpectMutation from './ExpectMutation';

export default function SwitchStatementMutatorSpec(name: string, expectMutation: ExpectMutation) {

  describe('SwitchStatementMutator', () => {
    it('should have name "SwitchStatement"', () => {
      expect(name).eq('SwitchStatement');
    });

    it('should remove non-default case', () => {
      expectMutation('switch (v) { case 42: a = "spam";break; }', 'switch (v) {}');
    });

    it('should not remove default case', () => {
      expectMutation('switch (v) {default: a = "spam";}');
    });

    it('should handle mixed cases appropriately', () => {
      expectMutation(
        'switch (v) { case 0: a = "foo"; case 1: a = "qux"; break; default: a = "spam";}',
        'switch (v) {default: a = "spam";}'
      );
    });
  });
}
