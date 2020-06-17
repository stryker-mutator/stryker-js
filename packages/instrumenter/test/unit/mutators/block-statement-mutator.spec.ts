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

  it('should mutate the block of a function into an empty block', () => {
    expectJSMutation(sut, '(function() { return 4; })', '(function() {})');
  });

  it('should mutate a single block', () => {
    expectJSMutation(sut, 'const a = 3; { const b = a; }', 'const a = 3; {}');
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

  // switch/case tests
  it('should not mutate the body of a switch or case statement, as not a block', () => {
    expectJSMutation(sut, 'switch (v) { case 42: a = "spam"; break; }');
  });

  it('should mutate the body of a case statement if defined as a block', () => {
    expectJSMutation(sut, 'switch (v) { case 42: { a = "spam"; break; } }', 'switch (v) { case 42: {} }');
  });

  // object tests
  it('should not mutate an object declaration, as not a block', () => {
    expectJSMutation(sut, 'const o = { foo: "bar" }');
  });
});
