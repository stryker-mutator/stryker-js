import { expect } from 'chai';
import sinon from 'sinon';

import { print } from '../../../src/printers/svelte-printer.js';
import { PrinterContext } from '../../../src/printers/index.js';
import { printerContextStub } from '../../helpers/stubs.js';
import { createJSAst, createRange, createSvelteAst, createTemplateScript } from '../../helpers/factories.js';

describe('svelte-printer', () => {
  let contextStub: sinon.SinonStubbedInstance<PrinterContext>;

  beforeEach(() => {
    contextStub = printerContextStub();
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
      root: { moduleScript: { ast: script, range: { start: script.root.start, end: script.root.end! }, isExpression: false }, additionalScripts: [] },
    });

    const output = print(ast, contextStub);

    expect(output).match(expectedOutput);
  });

  it('should replace multiple script tags and binding', () => {
    const expectedScriptContent = ['let name = "john";', 'let age = 30;', 'const city = "london";', 'let country = "uk";', '1 + 2;'];
    const scripts = [
      createTemplateScript({ ast: createJSAst({ rawContent: '1' }), range: createRange(8, 9) }),
      createTemplateScript({ ast: createJSAst({ rawContent: '2' }), range: createRange(43, 44) }),
      createTemplateScript({ ast: createJSAst({ rawContent: '4' }), range: createRange(99, 100) }),
      createTemplateScript({ ast: createJSAst({ rawContent: '3' }), range: createRange(81, 82) }),
      createTemplateScript({ ast: createJSAst({ rawContent: '5' }), range: createRange(110, 111), isExpression: true }),
    ];
    contextStub.print
      .withArgs(scripts[0].ast, sinon.match.any)
      .returns(expectedScriptContent[0])
      .withArgs(scripts[1].ast, sinon.match.any)
      .returns(expectedScriptContent[1])
      .withArgs(scripts[3].ast, sinon.match.any)
      .returns(expectedScriptContent[2])
      .withArgs(scripts[2].ast, sinon.match.any)
      .returns(expectedScriptContent[3])
      .withArgs(scripts[4].ast, sinon.match.any)
      .returns(expectedScriptContent[4]);
    const input = '<script>1</script><script context="module">2</script><div><h1>hello!</h1><script>3</script><script>4</script>{5}</div>';

    const expectedOutput =
      '<script>\nlet name = "john";\n</script><script context="module">\nlet age = 30;\n</script><div><h1>hello!</h1><script>\nconst city = "london";\n</script><script>\nlet country = "uk";\n</script>{1 + 2}</div>';

    const ast = createSvelteAst({ rawContent: input, root: { moduleScript: scripts[0], additionalScripts: scripts.slice(1) } });

    // Act
    const output = print(ast, contextStub);

    // Assert
    expect(output).eq(expectedOutput);
  });
});
