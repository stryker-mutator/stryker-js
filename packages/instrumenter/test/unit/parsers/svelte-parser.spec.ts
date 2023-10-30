import { expect } from 'chai';
import sinon from 'sinon';

import { ParserContext } from '../../../src/parsers/parser-context.js';
import { parse } from '../../../src/parsers/svelte-parser.js';
import { createJSAst, createRange, createTSAst } from '../../helpers/factories.js';
import { parserContextStub } from '../../helpers/stubs.js';
import { AstFormat, Range, TemplateScript } from '../../../src/syntax/index.js';

describe('svelte-parser', async () => {
  let contextStub: sinon.SinonStubbedInstance<ParserContext>;

  beforeEach(() => {
    contextStub = parserContextStub();
  });

  describe('svelte script tags', async () => {
    it('should be able to parse an instance script tag', async () => {
      const script = 'const name = "test"';
      const jsAst = createJSAst({ rawContent: script });
      const svelte = `<script>${script}</script><h1>Hello {name}!</h1>`;
      contextStub.parse
        .withArgs(script)
        .resolves(jsAst)
        .withArgs('name')
        .resolves(createJSAst({ rawContent: 'name' }));

      const actual = await parse(svelte, 'index.svelte', contextStub);

      expect(actual.root.additionalScripts[0].ast.root).eq(jsAst.root);
      expect(actual.root.additionalScripts[0].isExpression).false;
    });

    it('should parse scripts correctly', async () => {
      const script = 'const name = "test"';
      const jsAst = createJSAst({ rawContent: script });
      const svelte = `<script>${script}</script><h1>Hello {name}!</h1>`;
      contextStub.parse.resolves(jsAst);

      await parse(svelte, 'index.svelte', contextStub);

      sinon.assert.calledWithExactly(contextStub.parse, script, 'index.svelte', AstFormat.JS);
    });

    it('should offset the module script location correctly', async () => {
      const script = 'const name = "test"';
      const jsAst = createJSAst({ rawContent: script });
      const svelte = `// 0
// 1
// 2
// 3
<script context="module">${script}</script><h1>Hello {name}!</h1>`;
      contextStub.parse.resolves(jsAst);

      const parsed = await parse(svelte, 'index.svelte', contextStub);

      const expected: TemplateScript = {
        ast: {
          ...jsAst,
          offset: {
            line: 4,
            column: 25,
          },
        },
        range: {
          end: 45 + script.length,
          start: 45,
        },
        isExpression: false,
      };
      expect(parsed.root.moduleScript).deep.eq(expected);
    });

    it('should offset the instance script location correctly', async () => {
      const script = 'const name = "test"';
      const jsAst = createJSAst({ rawContent: script });
      const svelte = `// 0
// 1
// 2
// 3
<script>${script}</script><h1>Hello {name}!</h1>`;
      contextStub.parse.resolves(jsAst);

      const parsed = await parse(svelte, 'index.svelte', contextStub);

      const expected: TemplateScript = {
        ast: {
          ...jsAst,
          offset: {
            line: 4,
            column: 8,
          },
        },
        range: {
          end: 28 + script.length,
          start: 28,
        },
        isExpression: false,
      };
      expect(parsed.root.additionalScripts.find(({ isExpression: expression }) => !expression)).deep.eq(expected);
    });

    it('should offset the location of a template expression correctly', async () => {
      // Arrange
      const jsAst = createJSAst({ rawContent: 'name' });
      const svelte = `// 0
// 1
// 2
// 3
<script></script>
<h1>Hello {name}!</h1>`;
      contextStub.parse.resolves(jsAst);

      // Act
      const parsed = await parse(svelte, 'index.svelte', contextStub);

      // Assert
      const expected: TemplateScript = {
        ast: {
          ...jsAst,
          offset: {
            line: 5,
            column: 11,
          },
        },
        range: {
          end: 49 + 'name'.length,
          start: 49,
        },
        isExpression: true,
      };
      expect(parsed.root.additionalScripts.find(({ isExpression: expression }) => expression)).deep.eq(expected);
    });

    it('should offset the location of a template script correctly', async () => {
      // Arrange
      const script = `
      console.log('hello');
      `;
      const jsAst = createJSAst({ rawContent: script });
      const svelte = `// 0
<script></script>
<div>
      <script>${script}</script>
</div>`;
      contextStub.parse.resolves(jsAst);

      // Act
      const parsed = await parse(svelte, 'index.svelte', contextStub);

      // Assert
      const expected: TemplateScript = {
        ast: {
          ...jsAst,
          offset: {
            line: 3,
            column: 14,
          },
        },
        range: {
          end: 43 + script.length,
          start: 43,
        },
        isExpression: false,
      };
      expect(parsed.root.additionalScripts[1]).deep.eq(expected);
    });

    it('should find module script tag', async () => {
      const script = "const name = 'test'";
      const jsAst = createJSAst({ rawContent: script });
      const svelte = `<script context="module">${script}</script><h1>blah</h1>`;
      contextStub.parse.resolves(jsAst);

      const parsed = await parse(svelte, 'index.svelte', contextStub);

      expect(parsed.root.moduleScript).not.undefined;
    });

    it('should find an html script tag', async () => {
      const script = "const name = 'test'";
      const jsAst = createJSAst({ rawContent: script });
      const svelte = `<div><script>${script}</script></div>`;
      contextStub.parse.resolves(jsAst);

      const parsed = await parse(svelte, 'index.svelte', contextStub);

      expect(parsed.root.additionalScripts).lengthOf(1);
    });

    it('should find multiple html script tags', async () => {
      const scripts = ["const name = 'test'", "const test = 'test'"];
      const jsAsts = [createJSAst({ rawContent: scripts[0] }), createJSAst({ rawContent: scripts[1] })];
      const svelte = `<div><script>${scripts[0]}</script><script>${scripts[1]}</script></div>`;
      contextStub.parse.withArgs(scripts[0], sinon.match.any).resolves(jsAsts[0]).withArgs(scripts[1], sinon.match.any).resolves(jsAsts[1]);

      const parsed = await parse(svelte, 'index.svelte', contextStub);

      expect(parsed.root.additionalScripts).lengthOf(2);
    });

    it('should find all script tags (instance, module and html)', async () => {
      const scripts = ["const name = 'test'", "const name = 'world'", "const name = 'test'"];
      const jsAsts = [createJSAst({ rawContent: scripts[0] }), createJSAst({ rawContent: scripts[1] }), createJSAst({ rawContent: scripts[2] })];
      const svelte = `<script>${scripts[0]}</script><script context=\"module\">${scripts[1]}</script><div><h1>hello</h1><script>${scripts[2]}</script></div>`;
      contextStub.parse
        .withArgs(scripts[0], sinon.match.any)
        .resolves(jsAsts[0])
        .withArgs(scripts[1], sinon.match.any)
        .resolves(jsAsts[1])
        .withArgs(scripts[2], sinon.match.any)
        .resolves(jsAsts[2]);

      const parsed = await parse(svelte, 'index.svelte', contextStub);

      expect(parsed.root.moduleScript).not.undefined;
      expect(parsed.root.moduleScript?.range).deep.eq({ start: 61, end: 81 } satisfies Range);
      expect(parsed.root.additionalScripts).lengthOf(2);
      expect(parsed.root.additionalScripts[0].range).deep.eq({ start: 8, end: 27 } satisfies Range);
      expect(parsed.root.additionalScripts[1].range).deep.eq({ start: 117, end: 136 } satisfies Range);
    });

    it('should support typescript scripts', async () => {
      const scripts = ['const hello: string = "hello";', 'const foo: string = "foo";', 'const bar: string = "bar";'];
      const tsAsts = [createTSAst({ rawContent: scripts[0] }), createTSAst({ rawContent: scripts[1] }), createTSAst({ rawContent: scripts[2] })];
      const svelte = `<script lang="ts">${scripts[0]}</script><script lang="ts" context=\"module\">${scripts[1]}</script><div><h1>hello</h1><script lang="ts">${scripts[2]}</script></div>`;
      contextStub.parse
        .withArgs(scripts[0], 'index.svelte', AstFormat.TS)
        .resolves(tsAsts[0])
        .withArgs(scripts[1], 'index.svelte', AstFormat.TS)
        .resolves(tsAsts[1])
        .withArgs(scripts[2], 'index.svelte', AstFormat.TS)
        .resolves(tsAsts[2]);

      const parsed = await parse(svelte, 'index.svelte', contextStub);

      expect(parsed.root.moduleScript).ok;
      expect(parsed.root.moduleScript!.ast.root).eq(tsAsts[1].root);
      expect(parsed.root.additionalScripts).lengthOf(2);
      expect(parsed.root.additionalScripts[0].ast.root).eq(tsAsts[0].root);
      expect(parsed.root.additionalScripts[1].ast.root).eq(tsAsts[2].root);
    });
  });

  describe('template expressions', () => {
    it('should parse a {expression}', async () => {
      // Arrange
      const jsAst = createJSAst({ rawContent: 'foo' });
      jsAst.offset = { column: 6, line: 0 };
      const svelte = '<div>{foo}</div>';
      contextStub.parse.resolves(jsAst);

      // Act
      const ast = await parse(svelte, 'index.svelte', contextStub);

      // Assert
      sinon.assert.calledOnceWithExactly(contextStub.parse, 'foo', 'index.svelte', AstFormat.JS);
      const expectedTemplateScript: TemplateScript = {
        ast: jsAst,
        isExpression: true,
        range: createRange(6, 9),
      };
      expect(ast.root.additionalScripts).deep.eq([expectedTemplateScript]);
    });

    it('should parse a {@html expression}', async () => {
      // Arrange
      const jsAst = createJSAst({ rawContent: 'foo' });
      jsAst.offset = { column: 6, line: 0 };
      const svelte = '<div>{@html foo}</div>';
      contextStub.parse.resolves(jsAst);

      // Act
      const ast = await parse(svelte, 'index.svelte', contextStub);

      // Assert
      sinon.assert.calledOnceWithExactly(contextStub.parse, 'foo', 'index.svelte', AstFormat.JS);
      expect(ast.root.additionalScripts[0].ast.root).deep.eq(jsAst.root);
    });

    it('should parse a {#if expression} {:else if expression} block', async () => {
      // Arrange
      const firstIfExpression = 'age < 18';
      const secondIfExpression = 'age === 18';
      const firstIf = createJSAst({ rawContent: firstIfExpression });
      const secondIf = createJSAst({ rawContent: secondIfExpression });
      const svelte = `<div>
  {#if ${firstIfExpression}}
    <p>underaged</p>
  {:else if ${secondIfExpression}}
    <p>exactly 18</p>
  {:else}
    <p>adult</p>
  {/if}
</div>`;
      contextStub.parse.withArgs(firstIfExpression).resolves(firstIf);
      contextStub.parse.withArgs(secondIfExpression).resolves(secondIf);

      // Act
      const ast = await parse(svelte, 'index.svelte', contextStub);

      // Assert
      sinon.assert.calledTwice(contextStub.parse);
      sinon.assert.calledWithExactly(contextStub.parse, firstIfExpression, 'index.svelte', AstFormat.JS);
      sinon.assert.calledWithExactly(contextStub.parse, secondIfExpression, 'index.svelte', AstFormat.JS);
      expect(ast.root.additionalScripts).lengthOf(2);
      expect(ast.root.additionalScripts[0].ast.root).eq(firstIf.root);
      expect(ast.root.additionalScripts[1].ast.root).eq(secondIf.root);
    });

    it('should parse {#key expression}', async () => {
      // Arrange
      const keyExpression = 'age < 18';
      const keyAst = createJSAst({ rawContent: keyExpression });
      const svelte = `<div>
  {#key ${keyExpression}}
    <p>underaged</p>
  {/key}
</div>`;
      contextStub.parse.withArgs(keyExpression).resolves(keyAst);

      // Act
      const ast = await parse(svelte, 'index.svelte', contextStub);

      // Assert
      sinon.assert.calledOnceWithExactly(contextStub.parse, keyExpression, 'index.svelte', AstFormat.JS);
      expect(ast.root.additionalScripts).lengthOf(1);
      expect(ast.root.additionalScripts[0].ast.root).eq(keyAst.root);
    });

    it('should parse {#each expression}', async () => {
      // Arrange
      const eachExpression = '[1, 2, 3]';
      const keyAst = createJSAst({ rawContent: eachExpression });
      const svelte = `<div>
  {#each ${eachExpression} as n}
    <span>.</span>
  {/each}
</div>`;
      contextStub.parse.withArgs(eachExpression).resolves(keyAst);

      // Act
      const ast = await parse(svelte, 'index.svelte', contextStub);

      // Assert
      sinon.assert.calledOnceWithExactly(contextStub.parse, eachExpression, 'index.svelte', AstFormat.JS);
      expect(ast.root.additionalScripts).lengthOf(1);
      expect(ast.root.additionalScripts[0].ast.root).eq(keyAst.root);
    });

    it('should parse a {#await expression} block', async () => {
      // Arrange
      const awaitExpression = "fetch('https://api.agify.io?name=teun&country_id=NL')";
      const awaitAst = createJSAst({ rawContent: awaitExpression });
      const svelte = `<div>
  {#await ${awaitExpression}}
    <p>Loading</p>
  {:then value}
    <p>Done</p> 
  {:catch error}
    <p>Error</p>
  {/await}
</div>`;
      contextStub.parse.withArgs(awaitExpression).resolves(awaitAst);

      // Act
      const ast = await parse(svelte, 'index.svelte', contextStub);

      // Assert
      sinon.assert.calledOnceWithExactly(contextStub.parse, awaitExpression, 'index.svelte', AstFormat.JS);
      expect(ast.root.additionalScripts).lengthOf(1);
      expect(ast.root.additionalScripts[0].ast.root).eq(awaitAst.root);
    });

    it('should parse a {@const assignment} block', async () => {
      // Arrange
      const constAssignment = 'area = box.width * box.height';
      const constAst = createJSAst({ rawContent: constAssignment });
      const svelte = `<div>
  {@const ${constAssignment}}
</div>`;
      contextStub.parse.withArgs(constAssignment).resolves(constAst);

      // Act
      const ast = await parse(svelte, 'index.svelte', contextStub);

      // Assert
      sinon.assert.calledOnceWithExactly(contextStub.parse, constAssignment, 'index.svelte', AstFormat.JS);
      expect(ast.root.additionalScripts).lengthOf(1);
      expect(ast.root.additionalScripts[0].ast.root).eq(constAst.root);
    });

    it('should parse a on:event="handler" block', async () => {
      // Arrange
      const eventHandlerExpression = '() => (a += 1)';
      const eventHandlerAst = createJSAst({ rawContent: eventHandlerExpression });
      const svelte = `<div>
  <button on:click={${eventHandlerExpression}}>
    increase
  </button>
</div>`;
      contextStub.parse.withArgs(eventHandlerExpression).resolves(eventHandlerAst);

      // Act
      const ast = await parse(svelte, 'index.svelte', contextStub);

      // Assert
      sinon.assert.calledOnceWithExactly(contextStub.parse, eventHandlerExpression, 'index.svelte', AstFormat.JS);
      expect(ast.root.additionalScripts).lengthOf(1);
      expect(ast.root.additionalScripts[0].ast.root).eq(eventHandlerAst.root);
    });
  });
});
