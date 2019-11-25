import { expect } from 'chai';

import ExpectMutation from './ExpectMutation';

export default function StringLiteralMutatorSpec(name: string, expectMutation: ExpectMutation) {
  describe('StringLiteralMutator', () => {
    it('should have name "StringLiteral"', () => {
      expect(name).eq('StringLiteral');
    });

    it('should mutate a string literal with double quotes as an empty string and as a null value', () => {
      expectMutation('const b = "Hello world!";', 'const b = "";', 'const b = "**Stryker was here!**";', 'const b = null;');
    });

    it('should mutate a string literal with single quotes as an empty string and as a null value', () => {
      expectMutation("const b = 'Hello world!';", 'const b = "";', 'const b = "**Stryker was here!**";', 'const b = null;');
    });

    it('should mutate a template string as an empty string and as a null value', () => {
      expectMutation('const b = `Hello world!`;', 'const b = "";', 'const b = "**Stryker was here!**";', 'const b = null;');
    });

    it('should mutate a template string referencing another variable as an empty string and as a null value', () => {
      expectMutation(
        'const a = 10; const b = `mutations: ${a} out of 10`;',
        'const a = 10; const b = "";',
        'const a = 10; const b = "**Stryker was here!**";',
        'const a = 10; const b = null;'
      );
      expectMutation(
        'const a = 10; const b = `mutations: ${a}`;',
        'const a = 10; const b = "";',
        'const a = 10; const b = "**Stryker was here!**";',
        'const a = 10; const b = null;'
      );
      expectMutation(
        'const a = 10; const b = `mutations: ${a} out of 10`;',
        'const a = 10; const b = "";',
        'const a = 10; const b = "**Stryker was here!**";',
        'const a = 10; const b = null;'
      );
    });

    it('should mutate an empty string as a bogus string and as a null value', () => {
      expectMutation('const b = "";', 'const b = "**Stryker was here!**";', 'const b = null;');
    });

    it('should mutate an empty template string as a bogus string and as a null value', () => {
      expectMutation('const b = ``;', 'const b = "**Stryker was here!**";', 'const b = null;');
    });

    it('should not mutate import statements', () => {
      expectMutation('import * as foo from "foo";');
      expectMutation('import { foo } from "foo";');
      expectMutation('import foo from "foo";');
      expectMutation('import "foo";');
    });

    it('should not mutate export statements', () => {
      expectMutation('export * from "./foo";');
      expectMutation('export { foo as boo } from "./foo";');
    });

    it('should not mutate type declarations', () => {
      expectMutation(
        'const a: "hello" = "hello";',
        'const a: "hello" = "";',
        'const a: "hello" = "**Stryker was here!**";',
        'const a: "hello" = null;'
      );
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
