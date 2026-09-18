import { expect } from 'chai';
import sinon from 'sinon';

import { print } from '../../../src/printers/vue-printer.js';
import { PrinterContext } from '../../../src/printers/index.js';
import { printerContextStub } from '../../helpers/stubs.js';
import {
  createJSAst,
  createRange,
  createTemplateScript,
  createVueAst,
} from '../../helpers/factories.js';

describe('vue-printer', () => {
  let contextStub: sinon.SinonStubbedInstance<PrinterContext>;

  beforeEach(() => {
    contextStub = printerContextStub();
  });

  it('should output the original file when no scripts are found', () => {
    const expectedVue = '<template><h1>hello!</h1></template>';
    const ast = createVueAst({ rawContent: expectedVue });

    const output = print(ast, contextStub);

    expect(output).eq(expectedVue);
    expect(contextStub.print).not.called;
  });

  it('should replace the module script', () => {
    const script = createTemplateScript({
      ast: createJSAst({ rawContent: '1' }),
      range: createRange(8, 9),
    });
    contextStub.print.returns('const name = "test";');
    const ast = createVueAst({
      rawContent: '<script>1</script><h1>hello!</h1>',
      root: { moduleScript: script, additionalScripts: [] },
    });

    const output = print(ast, contextStub);

    expect(output).eq(
      '<script>\nconst name = "test";\n</script><h1>hello!</h1>',
    );
    expect(contextStub.print).calledOnceWithExactly(script.ast, contextStub);
  });

  it('should replace multiple script tags', () => {
    const scripts = [
      createTemplateScript({
        ast: createJSAst({ rawContent: '1' }),
        range: createRange(8, 9),
      }),
      createTemplateScript({
        ast: createJSAst({ rawContent: '2' }),
        range: createRange(32, 33),
      }),
    ];
    contextStub.print
      .withArgs(scripts[0].ast, sinon.match.any)
      .returns('let age = 30;')
      .withArgs(scripts[1].ast, sinon.match.any)
      .returns('let country = "uk";');
    const ast = createVueAst({
      rawContent: '<script>1</script><script setup>2</script>',
      root: { moduleScript: scripts[0], additionalScripts: [scripts[1]] },
    });

    const output = print(ast, contextStub);

    expect(output).eq(
      '<script>\nlet age = 30;\n</script><script setup>\nlet country = "uk";\n</script>',
    );
    expect(contextStub.print).calledTwice;
  });

  it('should order the scripts by range', () => {
    const scripts = [
      createTemplateScript({
        ast: createJSAst({ rawContent: '2' }),
        range: createRange(32, 33),
      }),
      createTemplateScript({
        ast: createJSAst({ rawContent: '1' }),
        range: createRange(8, 9),
      }),
    ];
    contextStub.print
      .withArgs(scripts[0].ast, sinon.match.any)
      .returns('let country = "uk";')
      .withArgs(scripts[1].ast, sinon.match.any)
      .returns('let age = 30;');
    const ast = createVueAst({
      rawContent: '<script>1</script><script setup>2</script>',
      root: { additionalScripts: scripts },
    });

    const output = print(ast, contextStub);

    expect(output).eq(
      '<script>\nlet age = 30;\n</script><script setup>\nlet country = "uk";\n</script>',
    );
  });
});
