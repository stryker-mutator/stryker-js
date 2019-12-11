import { expect } from 'chai';

import ExpectMutation from './ExpectMutation';

export default function SwitchCaseMutatorSpec(name: string, expectMutation: ExpectMutation) {
  describe('SwitchCaseMutator', () => {
    beforeEach(() => {
      console.warn('DEPRECATED: please migrate from the SwitchCaseMutatorSpec to the ConditionalExpressionMutatorSpec');
    });

    it('should have name "SwitchCase"', () => {
      expect(name).eq('SwitchCase');
    });

    it('should remove all cases one at a time', () => {
      expectMutation(
        'switch (v) {case 0: a = "foo"; case 1: a = "qux"; break; default: a = "spam";}',
        'switch (v) {case 0: case 1: a = "qux"; break; default: a = "spam";}',
        'switch (v) {case 0: a = "foo"; case 1: default: a = "spam";}',
        'switch (v) {case 0: a = "foo"; case 1: a = "qux"; break; default:}'
      );
    });

    it('should not mutate empty cases (0 consequent statements)', () => {
      expectMutation(
        'switch (v) {case 0: case 1: break; default: a = "spam";}',
        'switch (v) {case 0: case 1: default: a = "spam";}',
        'switch (v) {case 0: case 1: break; default:}'
      );
    });
  });
}
