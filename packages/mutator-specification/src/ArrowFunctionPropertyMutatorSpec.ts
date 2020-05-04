import { expect } from 'chai';

import ExpectMutation from './ExpectMutation';

export default function ArrowFunctionPropertyMutatorSpec(name: string, expectMutation: ExpectMutation) {
  describe('ArrowFunctionPropertyMutator', () => {
    it('should have name "ArrowFunctionProperty"', () => {
      expect(name).eq('ArrowFunctionProperty');
    });

    it('should mutate a single object property in an arrow function expression', () => {
      expectMutation('({ bar }) => baz', '({}) => baz');
    });

    it('should mutate multiple object shorthand properties in an arrow function expression', () => {
      expectMutation('({ bar, baz = "qux" }) => baz', '({ baz = "qux" }) => baz', '({ bar }) => baz');
    });

    it('shoud not mutate empty properties in an arrow function expression', () => {
      expectMutation('({}) => baz');
    });
  });
}
