import { expect } from 'chai';

import sinon from 'sinon';

import { print } from '../../../src/printers/svelte-printer.js';
import { PrinterContext } from '../../../src/printers/index.js';
import { printerContextStub } from '../../helpers/stubs.js';
import { createJSAst, createSvelteAst } from '../../helpers/factories.js';

describe.only('svelte-printer', () => {
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
    const ast = createSvelteAst({ rawContent: input, root: { scripts: [script] } });

    const output = print(ast, contextStub);

    expect(output).match(expectedOutput);
  });

  it('should replace multiple script tags', () => {
    const expectedScriptContent = ['let name = "john";', 'let age = 30;', 'const city = "london";', 'let country = "uk";'];
    const scripts = [
      createJSAst({ rawContent: '1' }),
      createJSAst({ rawContent: '2' }),
      createJSAst({ rawContent: '3' }),
      createJSAst({ rawContent: '4' }),
    ];
    contextStub.print
      .withArgs(scripts[0], sinon.match.any)
      .returns(expectedScriptContent[0])
      .withArgs(scripts[1], sinon.match.any)
      .returns(expectedScriptContent[1])
      .withArgs(scripts[2], sinon.match.any)
      .returns(expectedScriptContent[2])
      .withArgs(scripts[3], sinon.match.any)
      .returns(expectedScriptContent[3]);
    scripts[0].root.start = 8;
    scripts[0].root.end = 9;
    scripts[1].root.start = 43;
    scripts[1].root.end = 44;
    scripts[2].root.start = 81;
    scripts[2].root.end = 82;
    scripts[3].root.start = 99;
    scripts[3].root.end = 100;
    const input = '<script>1</script><script context="module">2</script><div><h1>hello!</h1><script>3</script><script>4</script></div>';
    const expectedOutput =
      /<script>.*let name = "john";.*<\/script><script context="module">.*let age = 30;.*<\/script><div><h1>hello!<\/h1><script>.*const city = "london";.*<\/script><script>.*let country = "uk";.*<\/script><\/div>/s;
    const ast = createSvelteAst({ rawContent: input, root: { scripts } });

    // Act
    const output = print(ast, contextStub);

    // Assert
    expect(output).match(expectedOutput);
  });

  it('should output scripts in the right order', () => {
    const expectedScriptContent = ['let name = "john";', 'let age = 30;'];
    const scripts = [createJSAst({ rawContent: '1' }), createJSAst({ rawContent: '2' })];
    contextStub.print
      .withArgs(scripts[0], sinon.match.any)
      .returns(expectedScriptContent[0])
      .withArgs(scripts[1], sinon.match.any)
      .returns(expectedScriptContent[1]);
    scripts[1].root.start = 8;
    scripts[1].root.end = 9;
    scripts[0].root.start = 43;
    scripts[0].root.end = 44;
    const input = '<script>1</script><script context="module">2</script><h1>hello!</h1>';
    const expectedOutput = /<script>.*let age = 30;.*<\/script><script context="module">.*let name = "john";.*<\/script><h1>hello!<\/h1>/s;
    const ast = createSvelteAst({ rawContent: input, root: { scripts } });

    // Act
    const output = print(ast, contextStub);

    // Assert
    expect(output).match(expectedOutput);
  });
});
