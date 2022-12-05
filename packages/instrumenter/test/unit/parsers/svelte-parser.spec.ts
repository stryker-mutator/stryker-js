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

      expect(parsed.root.scripts).lengthOf(1);
    });

    it('should find module script tag', async () => {
      const script = "const name = 'test'";
      const jsAst = createJSAst({ rawContent: script });
      const svelte = `<script context="module">${script}</script><h1>blah</h1>`;
      contextStub.parse.resolves(jsAst);

      const parsed = await parse(svelte, 'index.svelte', contextStub as ParserContext);

      expect(parsed.root.scripts).lengthOf(1);
    });

    it('should find html script tag', async () => {
      const script = "const name = 'test'";
      const jsAst = createJSAst({ rawContent: script });
      const svelte = `<div><script>${script}</script></div>`;
      contextStub.parse.resolves(jsAst);

      const parsed = await parse(svelte, 'index.svelte', contextStub as ParserContext);

      expect(parsed.root.scripts).lengthOf(1);
    });

    it('should find multiple html script tags', async () => {
      const scripts = ["const name = 'test'", "const test = 'test'"];
      const jsAsts = [createJSAst({ rawContent: scripts[0] }), createJSAst({ rawContent: scripts[1] })];
      const svelte = `<div><script>${scripts[0]}</script><script>${scripts[1]}</script></div>`;
      contextStub.parse.withArgs(scripts[0], sinon.match.any).resolves(jsAsts[0]).withArgs(scripts[1], sinon.match.any).resolves(jsAsts[1]);

      const parsed = await parse(svelte, 'index.svelte', contextStub as ParserContext);

      expect(parsed.root.scripts).lengthOf(2);
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

      expect(parsed.root.scripts).lengthOf(3);
    });
  });

  describe('correct offset', () => {
    it('should use the correct start and end number', async () => {
      const script = "let name = 'world';";
      const svelte = `<script>${script}</script><h1>Hello {name}!</h1>`;
      const jsAst = createJSAst({ rawContent: script });
      contextStub.parse.resolves(jsAst);

      const parsed = await parse(svelte, 'index.svelte', contextStub as ParserContext);

      expect(parsed.root.scripts[0].root.start).eq(8);
      expect(parsed.root.scripts[0].root.end).eq(27);
    });
  });
});