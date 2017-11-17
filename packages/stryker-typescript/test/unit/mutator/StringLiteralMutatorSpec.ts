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

  it('should mutate a template string referencing another variabled', () => {
    expectMutation(sut, 'const a = 10; const b = `${a} mutations`;', 'const a = 10; const b = "";');
    expectMutation(sut, 'const a = 10; const b = `mutations: ${a}`;', 'const a = 10; const b = "";');
    expectMutation(sut, 'const a = 10; const b = `mutations: ${a} out of 10`;', 'const a = 10; const b = "";');
  });

  it('should mutate empty strings', () => {
    expectMutation(sut, 'const b = "";', 'const b = "Stryker was here!";');
  });

  it('should mutate empty template strings', () => {
    expectMutation(sut, 'const b = ``;', 'const b = "Stryker was here!";');
  });

  it('should not mutate import statements', () => {
    expectMutation(sut, 'import * as foo from "foo";');
    expectMutation(sut, 'import { foo } from "foo";');
    expectMutation(sut, 'import foo from "foo";');
    expectMutation(sut, 'import "foo";');
  });

});
