import { expect } from 'chai';

import { BlockStatementMutator } from '../../../src/mutators/block-statement-mutator';
import { expectJSMutation } from '../../helpers/expect-mutation';

describe(BlockStatementMutator.name, () => {
  let sut: BlockStatementMutator;
  beforeEach(() => {
    sut = new BlockStatementMutator();
  });

  it('should have name "BlockStatement"', () => {
    expect(sut.name).eq('BlockStatement');
  });

  describe('blocks', () => {
    it('should mutate a single block', () => {
      expectJSMutation(sut, 'const a = 3; { const b = a; }', 'const a = 3; {}');
    });

    it('should not mutate an object declaration, as not a block', () => {
      expectJSMutation(sut, 'const o = { foo: "bar" }');
    });
  });

  describe('functions', () => {
    it('should mutate the block of a function into an empty block', () => {
      expectJSMutation(sut, '(function() { return 4; })', '(function() {})');
    });
    it('should not mutate an already empty block', () => {
      expectJSMutation(sut, '(function() {  })');
    });
    it('should mutate the body of an anonymous function if defined as a block', () => {
      expectJSMutation(sut, 'const b = () => { return 4; }', 'const b = () => {}');
    });

    it('should not mutate the body of an anonymous function if not defined as a block', () => {
      expectJSMutation(sut, 'const b = () => 4;');
    });
  });

  describe('switch/case', () => {
    it('should not mutate the body of a switch or case statement, as not a block', () => {
      expectJSMutation(sut, 'switch (v) { case 42: a = "spam"; break; }');
    });

    it('should mutate the body of a case statement if defined as a block', () => {
      expectJSMutation(sut, 'switch (v) { case 42: { a = "spam"; break; } }', 'switch (v) { case 42: {} }');
    });
  });

  describe('classes', () => {
    it('should mutate a constructor', () => {
      expectJSMutation(sut, 'class Foo { constructor() { bar(); } }', 'class Foo { constructor() {} }');
    });

    it('should mutate a constructor with (typescript) parameter properties', () => {
      expectJSMutation(sut, 'class Foo { constructor(private baz: string) { bar(); } }', 'class Foo { constructor(private baz: string) {} }');
    });

    it('should mutate a constructor with a super call', () => {
      expectJSMutation(sut, 'class Foo extends Bar { constructor(baz) { super(baz); } }', 'class Foo extends Bar { constructor(baz) {} }');
    });

    /**
     * @see https://github.com/stryker-mutator/stryker/issues/2314
     */
    it('should not mutate a constructor containing a super call and has (typescript) parameter properties', () => {
      expectJSMutation(sut, 'class Foo extends Bar { constructor(private baz: string) { super(); } }');
    });

    /**
     * @see https://github.com/stryker-mutator/stryker/issues/2474
     */
    it('should not mutate a constructor containing a super call and contains initialized properties', () => {
      expectJSMutation(sut, 'class Foo extends Bar { private baz = "qux"; constructor() { super(); } }');
    });
  });
});
