import { expect } from 'chai';

import sinon from 'sinon';

import { parse } from '../../../src/parsers/html-parser';
import { ParserContext } from '../../../src/parsers/parser-context';
import { parserContextStub } from '../../helpers/stubs';
import { createJSAst } from '../../helpers/factories';
import { AstFormat } from '../../../src/syntax';
import { ParseError } from '../../../src/parsers/parse-error';

describe('html-parser', () => {
  let contextStub: sinon.SinonStubbedInstance<ParserContext>;

  beforeEach(() => {
    contextStub = parserContextStub();
  });

  describe('parsing', () => {
    const simpleHtml = `
    <!DOCTYPE html>
    <html>
    <head>
    <title>Title of the document</title>
    </head>
    
    <body>
    The content of the document......
    </body>
    
    </html> 
    `;

    it('should be able to parse simple HTML', async () => {
      const parsed = await parse(simpleHtml, 'index.html', contextStub);
      expect(parsed).ok;
    });

    it('should work without script tags', async () => {
      const parsed = await parse(simpleHtml, 'index.html', contextStub);
      expect(parsed.root.scripts).lengthOf(0);
    });

    it('should throw an error on invalid HTML', async () => {
      await expect(parse('<p></div>', 'index.html', contextStub)).rejectedWith(
        ParseError,
        'Parse error in index.html (1:3) Unexpected closing tag "div".'
      );
    });
  });

  describe('html with one script tag', () => {
    const scriptContent = `
    console.log('hello world');
    `;
    const html = `
    <body>
    The content of the document......
    </body>
    <script>${scriptContent}</script>
    `;

    it('should deliver one script', async () => {
      const parsed = await parse(html, 'index.html', contextStub);
      expect(parsed.root.scripts).lengthOf(1);
    });

    it('should offset the location in the script', async () => {
      // Arrange
      const actualScriptAst = createJSAst({ rawContent: scriptContent });
      contextStub.parse.resolves(actualScriptAst);

      // Act
      const parsed = await parse(html, 'index.html', contextStub);

      // Assert
      expect(parsed.root.scripts[0].root.loc).deep.eq({
        start: { line: 5, column: 12 },
        end: { line: 7, column: 4 },
      });
      expect(parsed.root.scripts[0].root.start).eq(74);
      expect(parsed.root.scripts[0].root.end).eq(111);
    });
  });

  describe('script parsing', () => {
    const testCases = [
      { actualType: 'javascript', expectedType: AstFormat.JS },
      { actualType: 'JavaScript', expectedType: AstFormat.JS },
      { actualType: 'text/javascript', expectedType: AstFormat.JS },
      { actualType: 'js', expectedType: AstFormat.JS },
      { actualType: 'ts', expectedType: AstFormat.TS },
      { actualType: 'typescript', expectedType: AstFormat.TS },
      { actualType: 'TypeScript', expectedType: AstFormat.TS },
      { actualType: 'text/typescript', expectedType: AstFormat.TS },
    ];

    testCases.forEach(({ actualType, expectedType }) => {
      it(`should parse <script type="${actualType}"> as ${expectedType}`, async () => {
        const code = 'foo.bar(40,2)';
        await parse(`<script type="${actualType}">${code}</script>`, 'test.html', contextStub);
        expect(contextStub.parse).calledWith(code, 'test.html', expectedType);
      });
      it(`should parse <script lang="${actualType}"> as ${expectedType}`, async () => {
        const code = 'foo.bar(40,2)';
        await parse(`<script lang="${actualType}">${code}</script>`, 'test.html', contextStub);
        expect(contextStub.parse).calledWith(code, 'test.html', expectedType);
      });
    });

    it('should parse <script> without a "type" as js', async () => {
      const code = 'foo.bar(40,2)';
      await parse(`<script>${code}</script>`, 'test.html', contextStub);
      expect(contextStub.parse).calledWith(code, 'test.html', AstFormat.JS);
    });
    it('shouldn\'t parse scripts with a "src" attribute', async () => {
      await parse('<script src="foo.js"></script>', 'test.html', contextStub);
      expect(contextStub.parse).not.called;
    });

    it('should support script tags deep in html', async () => {
      await parse('<html><body><div><div><section><script></script></section></div></div></body></html>', 'test.html', contextStub);
      expect(contextStub.parse).called;
    });

    it('should support script tags with more attributes', async () => {
      await parse('<script defer type="ts"></script>', 'test.html', contextStub);
      expect(contextStub.parse).calledWith('', 'test.html', AstFormat.TS);
    });

    it('should ignore unknown script types', async () => {
      const parsed = await parse('<script type="text/template"><div></div></script>', 'test.html', contextStub);
      expect(parsed.root.scripts).lengthOf(0);
    });

    it('should support multiple script tags', async () => {
      // Arrange
      const script1 = 'foo.bar()';
      const script2 = 'baz.qux()';
      const script3 = 'quux.forge()';
      const html = `
      <html>
      <body>
      <script>${script1}</script>
      <script>${script2}</script>
      <script>${script3}</script>
      </body>
      </html>`;
      const expectedAsts = [createJSAst({ rawContent: script1 }), createJSAst({ rawContent: script2 }), createJSAst({ rawContent: script3 })];
      contextStub.parse
        .withArgs(script1)
        .resolves(expectedAsts[0])
        .withArgs(script2)
        .resolves(expectedAsts[1])
        .withArgs(script3)
        .resolves(expectedAsts[2]);

      // Act
      const {
        root: { scripts },
      } = await parse(html, 'test.html', contextStub);

      // Assert
      expect(contextStub.parse).calledThrice;
      expect(scripts).deep.eq(expectedAsts);
    });
  });
});
