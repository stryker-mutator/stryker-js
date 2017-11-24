import { expect } from 'chai';
import ExpectMutation from './ExpectMutation';

export default function BlockMutatorSpec(name: string, expectMutation: ExpectMutation) {

  describe('BlockMutator', () => {

    it('should have name "Block"', () => {
      expect(name).eq('Block');
    });

    it('should mutate the block of a function into an empty block', () => {
      expectMutation('function() { return 4; }', 'function() {}');
    });

    it('should mutate a single block', () => {
      expectMutation('const a = 3; { const b = a; }', 'const a = 3; {}');
    });

    it('should not mutate an already empty block', () => {
      expectMutation('function() {  }');
    });

    it('should mutate the body of an anonymous function if defined as a block', () => {
      expectMutation('const b = () => { return 4; }', 'const b = () => {}');
    });

    it('should not mutate the body of an anonymous function if not defined as a block', () => {
      expectMutation('const b = () => 4;');
    });

  });
}