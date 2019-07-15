import { expect } from 'chai';
import ExpectMutation from './ExpectMutation';

export default function blockMutatorSpec(
  name: string,
  expectMutation: ExpectMutation
) {
  describe('BlockMutator', () => {
    it('should have name "Block"', () => {
      expect(name).eq('Block');
    });

    it('should mutate the block of a function into an empty block', () => {
      expectMutation('(function() { return 4; })', '(function() {})');
    });

    it('should mutate a single block', () => {
      expectMutation('const a = 3; { const b = a; }', 'const a = 3; {}');
    });

    it('should not mutate an already empty block', () => {
      expectMutation('(function() {  })');
    });

    it('should mutate the body of an anonymous function if defined as a block', () => {
      expectMutation('const b = () => { return 4; }', 'const b = () => {}');
    });

    it('should not mutate the body of an anonymous function if not defined as a block', () => {
      expectMutation('const b = () => 4;');
    });

    // switch/case tests
    it('should not mutate the body of a switch or case statement, as not a block', () => {
      expectMutation('switch (v) { case 42: a = "spam"; break; }');
    });

    it('should mutate the body of a case statement if defined as a block', () => {
      expectMutation(
        'switch (v) { case 42: { a = "spam"; break; } }',
        'switch (v) { case 42: {} }'
      );
    });

    // object tests
    it('should not mutate an object declaration, as not a block', () => {
      expectMutation('const o = { foo: "bar" }');
    });
  });
}
