import { expect } from 'chai';
import sinon from 'sinon';

import { createHtmlAst, createJSAst } from '../../helpers/factories';
import { print } from '../../../src/printers/html-printer';
import { PrinterContext } from '../../../src/printers';
import { printerContextStub } from '../../helpers/stubs';
import { offsetLocations } from '../../../src/util/syntax-helpers';

describe('html-printer', () => {
  let contextStub: sinon.SinonStubbedInstance<PrinterContext>;

  beforeEach(() => {
    contextStub = printerContextStub();
  });

  it('should output original file if no scripts are found', () => {
    const expectedHtml = '<html><head><title>Title</title></head></html>';
    const ast = createHtmlAst({ rawContent: expectedHtml });
    const output = print(ast, contextStub);
    expect(output).eq(expectedHtml);
  });

  it('should replace a single script', () => {
    // Arrange
    const expectedScriptContent = 'foo = bar;';
    const jsScript = createJSAst({
      rawContent: expectedScriptContent,
    });
    contextStub.print.returns(expectedScriptContent);
    offsetLocations(jsScript.root, { column: 13, line: 1, position: 14 });
    const actualHtml = '<html><script>foo = baz;</script></html>';
    const expectedHtml = /<html><script>.*foo = bar;.*<\/script><\/html>/s;
    const ast = createHtmlAst({ rawContent: actualHtml, root: { scripts: [jsScript] } });

    // Act
    const output = print(ast, contextStub);

    // Assert
    expect(output).match(expectedHtml);
    expect(contextStub.print).calledOnce;
    expect(contextStub.print).calledWith(jsScript, contextStub);
  });

  it('should replace multiple scripts', () => {
    // Arrange
    const expectedScriptContent = ['foo = bar;', 'qux = quux;'];
    const scripts = [createJSAst({ rawContent: '1' }), createJSAst({ rawContent: '2' })];
    contextStub.print.withArgs(scripts[0]).returns(expectedScriptContent[0]).withArgs(scripts[1]).returns(expectedScriptContent[1]);
    scripts[0].root.start = 14;
    scripts[0].root.end = 15;
    scripts[1].root.start = 32;
    scripts[1].root.end = 33;
    const input = '<html><script>1</script><script>2</script></html>';
    const expectedOutput = /<html><script>.*foo = bar.*<\/script><script>.*qux = quux;.*<\/script><\/html>/s;
    const ast = createHtmlAst({ rawContent: input, root: { scripts } });

    // Act
    const output = print(ast, contextStub);

    // Assert
    expect(output).match(expectedOutput);
    expect(contextStub.print).calledTwice;
  });

  it('should output order scripts correctly', () => {
    // Arrange
    const expectedScriptContent = ['foo = bar;', 'qux = quux;'];
    const scripts = [createJSAst({ rawContent: '1' }), createJSAst({ rawContent: '2' })];
    contextStub.print.withArgs(scripts[0]).returns(expectedScriptContent[0]).withArgs(scripts[1]).returns(expectedScriptContent[1]);
    scripts[1].root.start = 14;
    scripts[1].root.end = 15;
    scripts[0].root.start = 32;
    scripts[0].root.end = 33;
    const input = '<html><script>1</script><script>2</script></html>';
    const expectedOutput = /<html><script>.*qux = quux;.*<\/script><script>.*foo = bar;.*<\/script><\/html>/s;
    const ast = createHtmlAst({ rawContent: input, root: { scripts } });

    // Act
    const output = print(ast, contextStub);

    // Assert
    expect(output).match(expectedOutput);
    expect(contextStub.print).calledTwice;
  });
});
