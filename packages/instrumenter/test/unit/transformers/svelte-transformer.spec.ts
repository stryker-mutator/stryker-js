import { expect } from 'chai';
import sinon from 'sinon';
import { types } from '@babel/core';

import { MutantCollector } from '../../../src/transformers/mutant-collector.js';
import { createTransformSvelte } from '../../../src/transformers/svelte-transformer.js';
import {
  createJSAst,
  createRange,
  createSvelteAst,
  createTemplateScript,
} from '../../helpers/factories.js';
import { transformerContextStub } from '../../helpers/stubs.js';
import {
  TransformerContext,
  TransformerOptions,
} from '../../../src/transformers/index.js';
import { instrumentationBabelHeader } from '../../../src/util/index.js';
import { Range } from '../../../src/syntax/index.js';
import { SvelteTemplateExpressionContext } from '../../../src/frameworks/svelte-template-expression-context.js';

describe('svelte-transformer', () => {
  let svelteTemplateExpressionContext: sinon.SinonStubbedInstance<SvelteTemplateExpressionContext>;
  let transformSvelte: ReturnType<typeof createTransformSvelte>;
  let mutantCollector: MutantCollector;
  let context: sinon.SinonStubbedInstance<TransformerContext>;

  beforeEach(() => {
    svelteTemplateExpressionContext = sinon.createStubInstance(
      SvelteTemplateExpressionContext,
    );
    transformSvelte = createTransformSvelte(svelteTemplateExpressionContext);
    mutantCollector = new MutantCollector();
    context = transformerContextStub();
  });

  it('should transform the module script', () => {
    // Arrange
    const inputScript = 'let name = "test"';
    const moduleScriptStart = '<script context="module">';
    const svelte = `${moduleScriptStart}${inputScript}</script><h1>hello!</h1>`;
    const jsAstOriginal = createJSAst({ rawContent: inputScript });
    const jsAst = createJSAst({ rawContent: inputScript });
    const moduleScript = createTemplateScript({
      ast: jsAst,
      range: createRange(
        moduleScriptStart.length,
        moduleScriptStart.length + inputScript.length,
      ),
    });
    const svelteAst = createSvelteAst({
      rawContent: svelte,
      root: { moduleScript, additionalScripts: [] },
    });

    // Act
    transformSvelte(svelteAst, mutantCollector, context);

    // Assert
    expect(svelteAst.root.moduleScript).not.deep.eq(jsAstOriginal);
    sinon.assert.calledOnceWithExactly(
      context.transform,
      jsAstOriginal,
      mutantCollector,
      {
        ...context,
        options: { ...context.options, noHeader: true },
      },
    );
  });

  it('should transform the svelte file with additional scripts', () => {
    // Arrange
    const scripts = ['let name = "test"', '1 + 2'];
    const svelte = `<script>${scripts[0]}</script>
    <h1>hello {${scripts[1]}}</h1>`;

    const jsAstsOriginal = scripts.map((script) =>
      createJSAst({ rawContent: script }),
    );
    const additionalScripts = [
      createTemplateScript({
        ast: jsAstsOriginal[2],
        range: createRange(78, 83),
      }),
      createTemplateScript({
        ast: jsAstsOriginal[1],
        range: createRange(50, 67),
      }),
    ];
    const svelteAst = createSvelteAst({
      rawContent: svelte,
      root: { additionalScripts },
    });

    // Act
    transformSvelte(svelteAst, mutantCollector, context);

    // Assert
    const expectedOptions: TransformerOptions = {
      ...context.options,
      noHeader: true,
    };
    sinon.assert.calledTwice(context.transform);
    sinon.assert.calledWithExactly(
      context.transform,
      jsAstsOriginal[1],
      mutantCollector,
      { ...context, options: expectedOptions },
    );
    sinon.assert.calledWithExactly(
      context.transform,
      jsAstsOriginal[2],
      mutantCollector,
      { ...context, options: expectedOptions },
    );
  });

  it('should mark template expression scripts in the expression context', () => {
    // Arrange
    const script = 'sum(1, 2)';
    const expression = 'sum(3, 4)';
    const jsScriptAst = createJSAst({ rawContent: script });
    const jsExpressionAst = createJSAst({ rawContent: expression });
    const additionalScripts = [
      createTemplateScript({
        ast: jsScriptAst,
        range: createRange(8, 18),
        isExpression: false,
      }),
      createTemplateScript({
        ast: jsExpressionAst,
        range: createRange(33, 42),
        isExpression: true,
      }),
    ];
    const svelteAst = createSvelteAst({
      rawContent: `<script>${script}</script><p>{${expression}}</p>`,
      root: { additionalScripts },
    });

    // Act
    transformSvelte(svelteAst, mutantCollector, context);

    // Assert
    sinon.assert.calledOnceWithExactly(
      svelteTemplateExpressionContext.markAsTemplateExpression,
      jsExpressionAst.root,
    );
  });

  it('should not mark non-expression scripts in the expression context', () => {
    // Arrange
    const moduleScriptContent = 'let isModule = true;';
    const scriptContent = 'let isInstance = true;';
    const moduleScriptStart = '<script context="module">';
    const scriptStart = `${moduleScriptStart}${moduleScriptContent}</script><script>`;
    const jsModuleAst = createJSAst({ rawContent: moduleScriptContent });
    const jsScriptAst = createJSAst({ rawContent: scriptContent });
    const moduleScript = createTemplateScript({
      ast: jsModuleAst,
      range: createRange(
        moduleScriptStart.length,
        moduleScriptStart.length + moduleScriptContent.length,
      ),
      isExpression: false,
    });
    const additionalScripts = [
      createTemplateScript({
        ast: jsScriptAst,
        range: createRange(
          scriptStart.length,
          scriptStart.length + scriptContent.length,
        ),
        isExpression: false,
      }),
    ];
    const svelteAst = createSvelteAst({
      rawContent: `<script context="module">${moduleScriptContent}</script><script>${scriptContent}</script><p>hello</p>`,
      root: { moduleScript, additionalScripts },
    });

    // Act
    transformSvelte(svelteAst, mutantCollector, context);

    // Assert
    sinon.assert.notCalled(
      svelteTemplateExpressionContext.markAsTemplateExpression,
    );
  });

  describe('header placement', () => {
    it('should not place a header when no mutants were added', () => {
      // Act
      const input = createSvelteAst();

      // Act
      transformSvelte(createSvelteAst(), mutantCollector, context);

      // Assert
      expect(input.root.moduleScript).undefined;
    });

    it('should place the instrumentation header atop the module script when mutants were added', () => {
      // Arrange
      const moduleScriptContent = 'let foo = 1 + 1;';
      const templateScriptContent = 'foo';
      const moduleScriptStart = '<script context="module">';
      const svelte = `${moduleScriptStart}${moduleScriptContent}</script><h1>hello!{${templateScriptContent}}</h1>`;
      const jsModule = createJSAst({ rawContent: moduleScriptContent });
      const moduleScriptSvelteNode = createTemplateScript({
        ast: jsModule,
        range: createRange(
          moduleScriptStart.length,
          moduleScriptStart.length + moduleScriptContent.length,
        ),
      });
      const jsTemplateScript = createJSAst({
        rawContent: templateScriptContent,
      });
      const templateNode = createTemplateScript({
        ast: jsTemplateScript,
        range: createRange(28, 33),
        isExpression: true,
      });
      const svelteAst = createSvelteAst({
        rawContent: svelte,
        root: {
          moduleScript: moduleScriptSvelteNode,
          additionalScripts: [templateNode],
        },
      });
      context.transform
        .withArgs(jsModule, sinon.match.any, sinon.match.any)
        .callsFake(() => {
          mutantCollector.collect(
            svelteAst.originFileName,
            jsModule.root.program,
            {
              mutatorName: 'test',
              replacement: types.binaryExpression(
                '-',
                types.numericLiteral(1),
                types.numericLiteral(1),
              ),
            },
          );
        });

      // Act
      transformSvelte(svelteAst, mutantCollector, context);

      // Assert
      expect(svelteAst.root.moduleScript!.ast.rawContent).eq(
        moduleScriptContent,
      ); // unchanged
      expect(svelteAst.root.moduleScript!.ast.root.program.body).length(5);
      expect(
        svelteAst.root.moduleScript!.ast.root.program.body.slice(0, 4),
      ).deep.eq(instrumentationBabelHeader);
    });

    it('should place the instrumentation header in an invented script module when the module script is absent', () => {
      // Arrange & Act
      const { svelteAst, rawContent } =
        arrangeAndActTransformWithMutantsWithoutModuleScript();

      // Assert
      expect(svelteAst.root.moduleScript).ok;
      const moduleScript = svelteAst.root.moduleScript!;
      expect(svelteAst.rawContent).eq(
        `<script context="module">\n\n</script>\n${rawContent}`,
      );
      expect(moduleScript.ast.rawContent).eq('');
      expect(moduleScript.ast.root.program.body).length(4);
      expect(moduleScript.ast.root.program.body).deep.eq(
        instrumentationBabelHeader,
      );
      expect(moduleScript.isExpression).false;
    });

    it('should offset the start and end location of additional script tags', () => {
      // Arrange & Act
      const { svelteAst } =
        arrangeAndActTransformWithMutantsWithoutModuleScript();

      // Assert
      expect(svelteAst.root.additionalScripts).lengthOf(1);
      const expectedRange: Range = { start: 48, end: 51 }; // = range + offset of the module script
      expect(svelteAst.root.additionalScripts[0].range).deep.eq(expectedRange);
    });

    function arrangeAndActTransformWithMutantsWithoutModuleScript() {
      const templateScriptContent = 'foo';
      const rawContent = `<h1>hello!{${templateScriptContent}}</h1>`;
      const jsTemplateScript = createJSAst({
        rawContent: templateScriptContent,
      });
      const templateNode = createTemplateScript({
        ast: jsTemplateScript,
        range: createRange(11, 14),
        isExpression: true,
      });
      const svelteAst = createSvelteAst({
        rawContent: rawContent,
        root: { additionalScripts: [templateNode] },
      });
      context.transform
        .withArgs(jsTemplateScript, sinon.match.any, sinon.match.any)
        .callsFake(() => {
          mutantCollector.collect(
            svelteAst.originFileName,
            jsTemplateScript.root.program,
            {
              mutatorName: 'bar',
              replacement: types.identifier('bar'),
            },
          );
        });
      transformSvelte(svelteAst, mutantCollector, context);
      return { rawContent, svelteAst };
    }
  });
});
