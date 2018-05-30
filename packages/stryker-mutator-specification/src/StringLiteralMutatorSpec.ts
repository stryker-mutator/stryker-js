import { expect } from 'chai';
import ExpectMutation from './ExpectMutation';

export default function StringLiteralMutatorSpec(name: string, expectMutation: ExpectMutation) {

  describe('StringLiteralMutator', () => {

    it('should have name "StringLiteral"', () => {
      expect(name).eq('StringLiteral');
    });

    it('should mutate a string literal with double quotes', () => {
      expectMutation('const b = "Hello world!";', 'const b = "";');
    });

    it('should mutate a string literal with single quotes', () => {
      expectMutation('const b = \'Hello world!\';', 'const b = "";');
    });

    it('should mutate a template string', () => {
      expectMutation('const b = `Hello world!`;', 'const b = "";');
    });

    it('should mutate a template string referencing another variable', () => {
      expectMutation('const a = 10; const b = `${a} mutations`;', 'const a = 10; const b = "";');
      expectMutation('const a = 10; const b = `mutations: ${a}`;', 'const a = 10; const b = "";');
      expectMutation('const a = 10; const b = `mutations: ${a} out of 10`;', 'const a = 10; const b = "";');
    });

    it('should mutate empty strings', () => {
      expectMutation('const b = "";', 'const b = "Stryker was here!";');
    });

    it('should mutate empty template strings', () => {
      expectMutation('const b = ``;', 'const b = "Stryker was here!";');
    });

    it('should not mutate import statements', () => {
      expectMutation('import * as foo from "foo";');
      expectMutation('import { foo } from "foo";');
      expectMutation('import foo from "foo";');
      expectMutation('import "foo";');
    });

    it('should not mutate type declarations', () => {
      expectMutation('const a: "hello" = "hello";', 'const a: "hello" = "";');
      expectMutation('const a: Record<"id", number> = { id: 10 }');
    });

    it('should not mutate string JSX attributes', () => {
      expectMutation('<Record class="row" />');
    });

    it('should not mutate directive prologues', () => {
      expectMutation('"use strict";"use asm";');
      expectMutation('function a() {"use strict";"use asm";}');
    });
  });
}