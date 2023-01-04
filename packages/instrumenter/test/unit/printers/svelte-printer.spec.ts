import { expect } from 'chai';

import sinon from 'sinon';

import { print } from '../../../src/printers/svelte-printer.js';
import { PrinterContext } from '../../../src/printers/index.js';
import { printerContextStub } from '../../helpers/stubs.js';
import { createJSAst, createSvelteAst, createSvelteScriptTag } from '../../helpers/factories.js';

describe('svelte-printer', () => {
  let contextStub: sinon.SinonStubbedInstance<PrinterContext>;

  beforeEach(() => {
    contextStub = printerContextStub();
  });

  it('should output original file if there are no script tags', () => {
    const expectedSvelte = '<h1>hello!</h1>';
    const ast = createSvelteAst({ rawContent: expectedSvelte });

    const output = print(ast, contextStub);

    expect(output).eq(expectedSvelte);
  });

  it('should replace single script tag', () => {
    const expectedScriptContent = 'const name = "test";';
    const script = createJSAst({ rawContent: '1' });
    contextStub.print.returns(expectedScriptContent);
    script.root.start = 8;
    script.root.start = 9;
    const input = '<script>1</script><h1>hello!</h1>';
    const expectedOutput = /<script>.*const name = "test";.*<\/script><h1>hello!<\/h1>/s;
    const ast = createSvelteAst({
      rawContent: input,
      root: { mainScript: { ast: script, range: { start: script.root.start, end: script.root.end! } }, additionalScripts: [] },
    });

    const output = print(ast, contextStub);

    expect(output).match(expectedOutput);
  });

  it('should replace multiple script tags', () => {
    const expectedScriptContent = ['let name = "john";', 'let age = 30;', 'const city = "london";', 'let country = "uk";'];
    const scripts = [
      createSvelteScriptTag(createJSAst({ rawContent: '1' }), 8, 9),
      createSvelteScriptTag(createJSAst({ rawContent: '2' }), 43, 44),
      createSvelteScriptTag(createJSAst({ rawContent: '3' }), 81, 82),
      createSvelteScriptTag(createJSAst({ rawContent: '4' }), 99, 100),
    ];
    contextStub.print
      .withArgs(scripts[0].ast, sinon.match.any)
      .returns(expectedScriptContent[0])
      .withArgs(scripts[1].ast, sinon.match.any)
      .returns(expectedScriptContent[1])
      .withArgs(scripts[2].ast, sinon.match.any)
      .returns(expectedScriptContent[2])
      .withArgs(scripts[3].ast, sinon.match.any)
      .returns(expectedScriptContent[3]);
    const input = '<script>1</script><script context="module">2</script><div><h1>hello!</h1><script>3</script><script>4</script></div>';
    const expectedOutput =
      /<script>.*let name = "john";.*<\/script><script context="module">.*let age = 30;.*<\/script><div><h1>hello!<\/h1><script>.*const city = "london";.*<\/script><script>.*let country = "uk";.*<\/script><\/div>/s;
    const ast = createSvelteAst({ rawContent: input, root: { mainScript: scripts[0], additionalScripts: scripts.slice(1) } });

    // Act
    const output = print(ast, contextStub);

    // Assert
    expect(output).match(expectedOutput);
  });
});
