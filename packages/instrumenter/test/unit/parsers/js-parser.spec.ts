import { expect } from 'chai';

import { createParser } from '../../../src/parsers/js-parser.js';
import { JSAst, AstFormat } from '../../../src/syntax/index.js';
import { expectAst, AstExpectation } from '../../helpers/syntax-test-helpers.js';
import { createParserOptions } from '../../helpers/factories.js';

describe('js-parser', () => {
  it('should be able to parse simple es5', async () => {
    const expected: Omit<JSAst, 'root'> = {
      format: AstFormat.JS,
      originFileName: 'foo.js',
      rawContent: 'var foo = "bar"',
    };
    const { format, originFileName, root, rawContent } = await createParser(createParserOptions())(expected.rawContent, expected.originFileName);
    expect(format).eq(expected.format);
    expect(rawContent).eq(expected.rawContent);
    expect(originFileName).eq(expected.originFileName);
    expectAst(root, (p) => p.isDeclaration());
  });

  describe('default plugins', () => {
    describe('with features', () => {
      const itShouldSupportAst = createActArrangeAndAssertHelper((name) => `https://babeljs.io/docs/en/babel-plugin-syntax-${name}`);
      itShouldSupportAst('async-generators', 'async function* agf() { await 1;}', (t) => t.isFunctionDeclaration() && (t.node.generator ?? false));
      itShouldSupportAst('dynamic-import', 'import("fs").then(console.log)', (t) => t.isImport());
      itShouldSupportAst('import-meta', 'console.log(import.meta);', (t) => t.isMetaProperty());
      itShouldSupportAst('big-int', 'const theBiggestInt = 9007199254740991n', (t) => t.isBigIntLiteral());
      itShouldSupportAst('logical-assignment-operators', 'a &&= b;', (t) => t.isAssignmentExpression() && t.node.operator === '&&=');
      itShouldSupportAst('jsx', '<h1>The car has { 2 + 2 } wheels</h1>', (t) => t.isJSXExpressionContainer());
    });

    describe('with experimental features', () => {
      // See https://babeljs.io/docs/en/plugins
      const itShouldSupportAst = createActArrangeAndAssertHelper((name) => `https://babeljs.io/docs/en/babel-plugin-proposal-${name}`);

      itShouldSupportAst('do-expressions', 'let a = do { if(x > 10) { "big"; } else { "small"; } }', (t) => t.isDoExpression());
      itShouldSupportAst('object-rest-spread', 'let { x, y, ...z } = { x: 1, y: 2, a: 3, b: 4 };', (t) => t.isRestElement());
      itShouldSupportAst('class-properties', 'class Foo { bar = "baz" }', (t) => t.isClassProperty());
      itShouldSupportAst('class-properties (private properties)', 'class Foo { #bar = "baz" }', (t) => t.isClassPrivateProperty());
      itShouldSupportAst('class-properties (private methods)', 'class Foo { #bar(){ return "baz"; } }', (t) => t.isClassPrivateMethod());

      itShouldSupportAst('export-default-from', 'export v from "mod";', (t) => t.isExportNamedDeclaration());
      itShouldSupportAst('export-namespace-from', 'export * as ns from "mod";', (t) => t.isExportNamespaceSpecifier());
      itShouldSupportAst('function-bind', 'obj::func', (t) => t.isBindExpression());
      itShouldSupportAst('function-sent', 'function* generator() { console.log("Sent", function.sent); console.log("Yield", yield);}', (t) =>
        t.isMetaProperty()
      );
      itShouldSupportAst('numeric-separator', 'let budget = 1_000_000_000_000;', (t) => t.isNumericLiteral());
      itShouldSupportAst('optional-catch-binding', 'try{ throw 0; } catch { }', (t) => t.isCatchClause() && t.node.param === null);
      itShouldSupportAst('optional-chaining', 'const baz = obj?.foo?.bar?.baz;', (t) => t.isOptionalMemberExpression());
      itShouldSupportAst('pipeline-operator', 'let result = "hello"  |> doubleSay  |> capitalize  |> exclaim;', (t) => t.isBinaryExpression());
      itShouldSupportAst(
        'nullish-coalescing-operator',
        'var foo = object.foo ?? "default";',
        (t) => t.isLogicalExpression() && t.node.operator === '??'
      );
      itShouldSupportAst(
        'throw-expressions',
        'const test = param === true || throw new Error("Falsy!");',
        (t) => t.isUnaryExpression() && t.node.operator === 'throw'
      );

      // @ts-expect-error not (yet) defined in the types
      itShouldSupportAst('partial-application', 'const addOne = add(1, ?);', (t) => t.isArgumentPlaceholder());
      itShouldSupportAst('decorators', '@annotation class MyClass { }', (t) => t.isDecorator());
    });

    describe('language extensions (https://babeljs.io/docs/en/babel-parser#language-extensions)', () => {
      it('should support v8intrinsic', async () => {
        const { root } = await createParser(createParserOptions())('%DebugPrint(foo);', 'test.js');
        // @ts-expect-error not (yet) defined in the types
        expectAst(root, (t) => t.isV8IntrinsicIdentifier());
      });
    });
    function createActArrangeAndAssertHelper(makeUrl: (name: string) => string) {
      return (babelProposalName: string, input: string, expectation: AstExpectation, only = false) => {
        (only ? it.only : it)(`should support "${babelProposalName}" (${makeUrl(babelProposalName)})`, async () => {
          const { root } = await createParser(createParserOptions())(input, 'test.js');
          expectAst(root, expectation);
        });
      };
    }
  });

  describe('override plugins', () => {
    it('should allow to override with empty plugins', async () => {
      const parse = createParser(createParserOptions({ plugins: [] }));
      await expect(parse('let result = "hello"  |> doubleSay;', 'file.js')).rejected;
    });
    it('should allow to force one plugin', async () => {
      const parse = createParser(createParserOptions({ plugins: ['exportDefaultFrom'] }));
      await expect(parse('export default from "./"', 'file.js')).not.rejected;
    });
  });
});
