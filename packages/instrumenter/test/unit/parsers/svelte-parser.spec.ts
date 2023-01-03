import { expect } from 'chai';
import sinon from 'sinon';

import { ParserContext } from '../../../src/parsers/parser-context.js';

import { parse } from '../../../src/parsers/svelte-parser.js';
import { createJSAst } from '../../helpers/factories.js';
import { parserContextStub } from '../../helpers/stubs.js';

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

      const parsed = await parse(svelte, 'index.svelte', contextStub as ParserContext);

      expect(parsed).ok;
    });
  });

  describe('svelte script tags', async () => {
    it('should find instance script tag', async () => {
      const script = 'const name = "test"';
      const jsAst = createJSAst({ rawContent: script });
      const svelte = `<script>${script}</script><h1>Hello {name}!</h1>`;
      contextStub.parse.resolves(jsAst);

      const parsed = await parse(svelte, 'index.svelte', contextStub as ParserContext);

      expect(parsed.root.mainScript).not.undefined;
    });

    it('should find module script tag', async () => {
      const script = "const name = 'test'";
      const jsAst = createJSAst({ rawContent: script });
      const svelte = `<script context="module">${script}</script><h1>blah</h1>`;
      contextStub.parse.resolves(jsAst);

      const parsed = await parse(svelte, 'index.svelte', contextStub as ParserContext);

      expect(parsed.root.mainScript).not.undefined;
    });

    it('should find html script tag', async () => {
      const script = "const name = 'test'";
      const jsAst = createJSAst({ rawContent: script });
      const svelte = `<div><script>${script}</script></div>`;
      contextStub.parse.resolves(jsAst);

      const parsed = await parse(svelte, 'index.svelte', contextStub as ParserContext);

      expect(parsed.root.additionalScripts).lengthOf(1);
    });

    it('should find multiple html script tags', async () => {
      const scripts = ["const name = 'test'", "const test = 'test'"];
      const jsAsts = [createJSAst({ rawContent: scripts[0] }), createJSAst({ rawContent: scripts[1] })];
      const svelte = `<div><script>${scripts[0]}</script><script>${scripts[1]}</script></div>`;
      contextStub.parse.withArgs(scripts[0], sinon.match.any).resolves(jsAsts[0]).withArgs(scripts[1], sinon.match.any).resolves(jsAsts[1]);

      const parsed = await parse(svelte, 'index.svelte', contextStub as ParserContext);

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

      const parsed = await parse(svelte, 'index.svelte', contextStub as ParserContext);

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

      const parsed = await parse(svelte, 'index.svelte', contextStub as ParserContext);

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
      </div>
      `;
      const jsAst = createJSAst({ rawContent: script });
      contextStub.parse.resolves(jsAst);

      const ast = await parse(svelte, 'index.svelte', contextStub as ParserContext);

      expect(ast.root.bindingExpressions!.length).eq(11);
    });
  });
});
