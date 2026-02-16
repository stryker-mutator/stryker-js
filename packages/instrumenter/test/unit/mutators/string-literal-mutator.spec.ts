import { expect } from 'chai';

import { expectJSMutation } from '../../helpers/expect-mutation.js';
import { stringLiteralMutator as sut } from '../../../src/mutators/string-literal-mutator.js';

describe(sut.name, () => {
  it('should have name "StringLiteral"', () => {
    expect(sut.name).eq('StringLiteral');
  });

  describe('string literals', () => {
    it('should mutate a string literal with double quotes', () => {
      expectJSMutation(sut, 'const b = "Hello world!";', 'const b = "";');
    });

    it('should mutate a string literal with single quotes', () => {
      expectJSMutation(sut, "const b = 'Hello world!';", 'const b = "";');
    });

    it('should mutate a template string', () => {
      expectJSMutation(sut, 'const b = `Hello world!`;', 'const b = ``;');
    });

    it('should mutate a template string referencing another variable', () => {
      expectJSMutation(
        sut,
        'const a = 10; const b = `${a} mutations`;',
        'const a = 10; const b = ``;',
      );
      expectJSMutation(
        sut,
        'const a = 10; const b = `mutations: ${a}`;',
        'const a = 10; const b = ``;',
      );
      expectJSMutation(
        sut,
        'const a = 10; const b = `mutations: ${a} out of 10`;',
        'const a = 10; const b = ``;',
      );
    });

    it('should mutate empty strings', () => {
      expectJSMutation(sut, 'const b = "";', 'const b = "Stryker was here!";');
    });

    it('should mutate empty template strings', () => {
      expectJSMutation(sut, 'const b = ``;', 'const b = `Stryker was here!`;');
    });

    it('should not mutate directive prologues', () => {
      expectJSMutation(sut, '"use strict";"use asm";');
      expectJSMutation(sut, 'function a() {"use strict";"use asm";}');
    });

    it('should not mutate string literals in symbols with descriptions', () => {
      expectJSMutation(sut, "const a = Symbol('foo');");
      expectJSMutation(sut, 'const a = Symbol("foo");');
    });

    it('should not mutate symbols without description', () => {
      expectJSMutation(sut, 'const a = Symbol();');
    });

    it('should mutate template literals in symbols with descriptions', () => {
      expectJSMutation(
        sut,
        'const a = Symbol(`foo`);',
        'const a = Symbol(``);',
      );
      expectJSMutation(
        sut,
        "const a = Symbol('foo' + 'bar');",
        'const a = Symbol(\'foo\' + "");',
        'const a = Symbol("" + \'bar\');',
      );
    });
  });

  describe('imports/exports', () => {
    it('should not mutate import statements', () => {
      expectJSMutation(sut, 'import * as foo from "foo";');
      expectJSMutation(sut, 'import { foo } from "foo";');
      expectJSMutation(sut, 'import foo from "foo";');
      expectJSMutation(sut, 'import "foo";');
    });

    it('should not mutate require call statements', () => {
      expectJSMutation(sut, 'require("./lib/square");');
    });

    it('should not mutate import call expressions', () => {
      expectJSMutation(sut, 'import("foo/bar");');
    });

    it('should mutate other call statements', () => {
      expectJSMutation(sut, 'require2("./lib/square");', 'require2("");');
    });

    it('should not mutate export statements', () => {
      expectJSMutation(sut, 'export * from "./foo";');
      expectJSMutation(sut, 'export { foo as boo } from "./foo";');
    });
  });

  describe('type declarations', () => {
    it('should not mutate type declarations', () => {
      expectJSMutation(
        sut,
        'const a: "hello" = "hello";',
        'const a: "hello" = "";',
      );
      expectJSMutation(sut, 'const a: Record<"id", number> = { id: 10 }');
    });

    // interfaces itself are skipped entirely by the babel-transformer
  });

  describe('object properties', () => {
    it('should not mutate inside object property keys', () => {
      expectJSMutation(
        sut,
        'const { className, "aria-label": label } = props;',
      );
    });
    it('should not mutate inside object property keys', () => {
      expectJSMutation(
        sut,
        'const foo = { className, ["aria-label"]: label };',
      );
    });
    it('should still mutate inside object property values', () => {
      expectJSMutation(
        sut,
        'const foo = { bar: "baz" };',
        'const foo = { bar: "" };',
      );
    });
    it('should not mutate class property keys', () => {
      expectJSMutation(sut, 'class Foo { "baz-bar" = 4; }');
    });
    it('should not mutate method names', () => {
      expectJSMutation(
        sut,
        'const watchers = {"category.type"(categoryType) { }}',
      );
    });
    it('should mutate class property values', () => {
      expectJSMutation(
        sut,
        'class Foo { bar = "4"; }',
        'class Foo { bar = ""; }',
      );
    });
  });

  describe('jsx', () => {
    it('should not mutate string JSX attributes', () => {
      expectJSMutation(sut, '<Record class="row" />');
    });
  });
});
