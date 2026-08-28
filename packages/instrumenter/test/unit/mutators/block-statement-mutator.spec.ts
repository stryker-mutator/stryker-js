import { expect } from 'chai';

import { blockStatementMutator as sut } from '../../../src/mutators/block-statement-mutator.js';
import { expectJSMutation } from '../../helpers/expect-mutation.js';

describe(sut.name, () => {
  it('should have name "BlockStatement"', () => {
    expect(sut.name).eq('BlockStatement');
  });

  describe('blocks', () => {
    it('should mutate a single block', () => {
      expectJSMutation(
        sut,
        'const a = 3; { const b = a; }',
        { isExpressionContext: false },
        'const a = 3; {}',
      );
    });

    it('should not mutate an object declaration, as not a block', () => {
      expectJSMutation(sut, 'const o = { foo: "bar" }', {
        isExpressionContext: false,
      });
    });
  });

  describe('functions', () => {
    it('should mutate the block of a function into an empty block', () => {
      expectJSMutation(
        sut,
        '(function() { return 4; })',
        { isExpressionContext: false },
        '(function() {})',
      );
    });
    it('should not mutate an already empty block', () => {
      expectJSMutation(sut, '(function() {  })', {
        isExpressionContext: false,
      });
    });
    it('should mutate the body of an anonymous function if defined as a block', () => {
      expectJSMutation(
        sut,
        'const b = () => { return 4; }',
        { isExpressionContext: false },
        'const b = () => {}',
      );
    });

    it('should not mutate the body of an anonymous function if not defined as a block', () => {
      expectJSMutation(sut, 'const b = () => 4;', {
        isExpressionContext: false,
      });
    });
  });

  describe('switch/case', () => {
    it('should not mutate the body of a switch or case statement, as not a block', () => {
      expectJSMutation(sut, 'switch (v) { case 42: a = "spam"; break; }', {
        isExpressionContext: false,
      });
    });

    it('should mutate the body of a case statement if defined as a block', () => {
      expectJSMutation(
        sut,
        'switch (v) { case 42: { a = "spam"; break; } }',
        { isExpressionContext: false },
        'switch (v) { case 42: {} }',
      );
    });
  });

  describe('classes', () => {
    it('should mutate a constructor', () => {
      expectJSMutation(
        sut,
        'class Foo { constructor() { bar(); } }',
        { isExpressionContext: false },
        'class Foo { constructor() {} }',
      );
    });

    it('should mutate a constructor with (typescript) parameter properties without a `super()` call', () => {
      expectJSMutation(
        sut,
        'class Foo { constructor(private baz: string) { bar(); } }',
        { isExpressionContext: false },
        'class Foo { constructor(private baz: string) {} }',
      );
    });

    it('should mutate a constructor with a super call', () => {
      expectJSMutation(
        sut,
        'class Foo extends Bar { constructor(baz) { super(baz); } }',
        { isExpressionContext: false },
        'class Foo extends Bar { constructor(baz) {} }',
      );
    });

    /**
     * @see https://github.com/stryker-mutator/stryker-js/issues/2314
     * @see https://github.com/stryker-mutator/stryker-js/issues/4744
     */
    it('should not mutate a constructor containing a super call and has (typescript) parameter properties', () => {
      expectJSMutation(
        sut,
        'class Foo extends Bar { constructor(private baz: string) { super(); } }',
        { isExpressionContext: false },
      );
      expectJSMutation(
        sut,
        'class Foo extends Bar { constructor(private baz: string) { const errorBody: Body = { message: `msg: ${baz}` }; super(errorBody);  } }',
        { isExpressionContext: false },
      );
    });

    /**
     * @see https://github.com/stryker-mutator/stryker-js/issues/2474
     * @see https://github.com/stryker-mutator/stryker-js/issues/4744
     */
    it('should not mutate a constructor containing a super call and contains initialized properties', () => {
      expectJSMutation(
        sut,
        'class Foo extends Bar { private baz = "qux"; constructor() { super(); } }',
        { isExpressionContext: false },
      );
      expectJSMutation(
        sut,
        'class Foo extends Bar { private baz = "qux"; constructor() { const errorBody: Body = { message: `msg: ${baz}` }; super(errorBody);  } }',
        { isExpressionContext: false },
      );
    });
  });
});
