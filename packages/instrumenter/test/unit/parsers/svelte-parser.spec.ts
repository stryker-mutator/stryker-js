import { expect } from 'chai';
import sinon from 'sinon';

import { ParserContext } from '../../../src/parsers/parser-context.js';

import { parse } from '../../../src/parsers/svelte-parser.js';
import { createJSAst } from '../../helpers/factories.js';
import { parserContextStub } from '../../helpers/stubs.js';
import { AstFormat, SvelteNode } from '../../../src/syntax/index.js';

describe('svelte-parser', async () => {
  let contextStub: sinon.SinonStubbedInstance<ParserContext>;

  beforeEach(() => {
    contextStub = parserContextStub();
  });

  describe('parsing', async () => {
    it('should be able to parse simple svelte file', async () => {
      const script = "let name = 'world';";
      const svelte = `<script>${script}</script><h1>Hello {name}!</h1>`;
      const jsAst = createJSAst({ rawContent: script });
      contextStub.parse.resolves(jsAst);

      const parsed = await parse(svelte, 'index.svelte', contextStub);

      expect(parsed).ok;
    });
  });

  describe('svelte script tags', async () => {
    it('should find instance script tag', async () => {
      const script = 'const name = "test"';
      const jsAst = createJSAst({ rawContent: script });
      const svelte = `<script>${script}</script><h1>Hello {name}!</h1>`;
      contextStub.parse.resolves(jsAst);

      const parsed = await parse(svelte, 'index.svelte', contextStub);

      expect(parsed.root.mainScript).not.undefined;
    });

    it('should parse scripts correctly', async () => {
      const script = 'const name = "test"';
      const jsAst = createJSAst({ rawContent: script });
      const svelte = `<script>${script}</script><h1>Hello {name}!</h1>`;
      contextStub.parse.resolves(jsAst);

      await parse(svelte, 'index.svelte', contextStub);

      sinon.assert.calledWithExactly(contextStub.parse, script, 'index.svelte', AstFormat.JS);
    });

    it('should offset the script location correctly', async () => {
      const script = 'const name = "test"';
      const jsAst = createJSAst({ rawContent: script });
      const svelte = `// 0
// 1
// 2
// 3
<script>${script}</script><h1>Hello {name}!</h1>`;
      contextStub.parse.resolves(jsAst);

      const parsed = await parse(svelte, 'index.svelte', contextStub);

      const expected: SvelteNode = {
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
        expression: false,
      };
      expect(parsed.root.mainScript).deep.eq(expected);
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
      const expected: SvelteNode = {
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
        expression: true,
      };
      expect(parsed.root.additionalScripts[0]).deep.eq(expected);
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
      const expected: SvelteNode = {
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
        expression: false,
      };
      expect(parsed.root.additionalScripts[0]).deep.eq(expected);
    });

    it('should find module script tag', async () => {
      const script = "const name = 'test'";
      const jsAst = createJSAst({ rawContent: script });
      const svelte = `<script context="module">${script}</script><h1>blah</h1>`;
      contextStub.parse.resolves(jsAst);

      const parsed = await parse(svelte, 'index.svelte', contextStub);

      expect(parsed.root.mainScript).not.undefined;
    });

    it('should find html script tag', async () => {
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

      expect(parsed.root.mainScript).not.undefined;
      expect(parsed.root.additionalScripts).lengthOf(2);
    });
  });

  describe('correct offset', () => {
    it('should use the correct start and end number', async () => {
      const script = "let name = 'world';";
      const svelte = `<script>${script}</script><h1>Hello {name}!</h1>`;
      const jsAst = createJSAst({ rawContent: script });
      contextStub.parse.resolves(jsAst);

      const parsed = await parse(svelte, 'index.svelte', contextStub);

      expect(parsed.root.mainScript?.range.start).eq(8);
      expect(parsed.root.mainScript?.range.end).eq(27);
    });
  });

  describe('template expressions', () => {
    it('Should call the correct amount of parse functions', async () => {
      const script = 'let a = 0; let temp = ["first", "second"];';
      const svelte = `<script>${script}</script>     
      <div>
        <button on:click={() => (a += 1)}>
          increase a: {a}
        </button>
        
        {#if a < 5}
          <p>a is lower than 5, it's: {a}</p>
        {:else if a < 5}
          <p>b is lower than 5, it's: {a + 2}</p>
        {/if}
      
        {#each temp as val}
          {@const length = val.length}
          {length}
        {/each}
      
        {#key a}
          <p>updates when a updates, it's {a}</p>
        {/key}

        {#await fetch('https://api.agify.io?name=teun&country_id=NL')}
          <p>Wait for your estimated age</p>
        {:then value}
          <p>Your estimated age is: {#await value.json() } <p>default</p>{:then age}{age.age}{/await}</p> 
        {:catch error}
          <p>Something went test wrong: {error.message}</p>
        {/await}
      </div>
      `;
      const jsAst = createJSAst({ rawContent: script });
      contextStub.parse.resolves(jsAst);

      const ast = await parse(svelte, 'index.svelte', contextStub);

      expect(ast.root.additionalScripts.length).eq(15);
      ast.root.additionalScripts.forEach((node) => {
        expect(node.expression).to.be.true;
      });
      ast.root.additionalScripts.forEach((node) => {
        expect(node.ast.root).to.exist;
      });
    });
  });
});
