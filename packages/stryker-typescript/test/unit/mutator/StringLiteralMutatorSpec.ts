import { expect } from 'chai';
import { expectMutation } from './mutatorAssertions';
import StringLiteralMutator from '../../../src/mutator/StringLiteralMutator';

describe('StringLiteralMutator', () => {

  let sut: StringLiteralMutator;

  beforeEach(() => {
    sut = new StringLiteralMutator();
  });

  it('should have name "StringLiteral"', () => {
    expect(sut.name).eq('StringLiteral');
  });

  it('should mutate a string literal with double quotes', () => {
    expectMutation(sut, 'const b = "Hello world!";', 'const b = "";');
  });

  it('should mutate a string literal with single quotes', () => {
    expectMutation(sut, 'const b = \'Hello world!\';', 'const b = "";');
  });

  it('should mutate a template string', () => {
    expectMutation(sut, 'const b = `Hello world!`;', 'const b = "";');
  });

  it('should mutate a template string referencing another variable', () => {
    expectMutation(sut, 'const a = 10; const b = `${a} mutations`;', 'const a = 10; const b = "";');
  });

  it('should mutate a template string referencing another variable', () => {
    expectMutation(sut, 'const a = 10; const b = `mutations: ${a}`;', 'const a = 10; const b = "";');
  });

  it('should mutate a template string referencing another variable', () => {
    expectMutation(sut, 'const a = 10; const b = `mutations: ${a} out of 10`;', 'const a = 10; const b = "";');
  });

  it('should mutate import statements', () => {
    // It would be best if this wasn't actually the case. Thanks to the lack of context (ie. node.parent) it
    // doesn't seem possible right now. This will virtually always end up in a compile error so shouldn't
    // affect throughput.
    expectMutation(sut, 'import * as foo from "foo";', 'import * as foo from "";');
  });

});
