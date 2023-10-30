import { expect } from 'chai';
import sinon from 'sinon';
import { types } from '@babel/core';

import { MutantCollector } from '../../../src/transformers/mutant-collector.js';
import { transformSvelte } from '../../../src/transformers/svelte-transformer.js';
import { createJSAst, createRange, createSvelteAst, createTemplateScript } from '../../helpers/factories.js';
import { transformerContextStub } from '../../helpers/stubs.js';
import { TransformerOptions } from '../../../src/transformers/index.js';
import { instrumentationBabelHeader } from '../../../src/util/index.js';
import { Range } from '../../../src/syntax/index.js';

describe('svelte-transformer', () => {
  it('should transform the module script', () => {
    // Arrange
    const inputScript = 'let name = "test"';
    const moduleScriptStart = '<script context="module">';
    const svelte = `${moduleScriptStart}${inputScript}</script><h1>hello!</h1>`;
    const jsAstOriginal = createJSAst({ rawContent: inputScript });
    const jsAst = createJSAst({ rawContent: inputScript });
    const moduleScript = createTemplateScript({
      ast: jsAst,
      range: createRange(moduleScriptStart.length, moduleScriptStart.length + inputScript.length),
    });
    const svelteAst = createSvelteAst({ rawContent: svelte, root: { moduleScript, additionalScripts: [] } });
    const mutantCollector = new MutantCollector();
    const context = transformerContextStub();

    // Act
    transformSvelte(svelteAst, mutantCollector, context);

    // Assert
    expect(svelteAst.root.moduleScript).not.deep.eq(jsAstOriginal);
    sinon.assert.calledOnceWithExactly(context.transform, jsAstOriginal, mutantCollector, {
      ...context,
      options: { ...context.options, noHeader: true },
    });
  });

  it('should transform the svelte file with additional scripts', () => {
    // Arrange
    const scripts = ['let name = "test"', '1 + 2'];
    const svelte = `<script>${scripts[0]}</script>
    <h1>hello {${scripts[1]}}</h1>`;

    const jsAstsOriginal = scripts.map((script) => createJSAst({ rawContent: script }));
    const additionalScripts = [
      createTemplateScript({ ast: jsAstsOriginal[2], range: createRange(78, 83) }),
      createTemplateScript({ ast: jsAstsOriginal[1], range: createRange(50, 67) }),
    ];
    const svelteAst = createSvelteAst({
      rawContent: svelte,
      root: { additionalScripts },
    });
    const mutantCollector = new MutantCollector();
    const context = transformerContextStub();

    // Act
    transformSvelte(svelteAst, mutantCollector, context);

    // Assert
    const expectedOptions: TransformerOptions = { ...context.options, noHeader: true };
    sinon.assert.calledTwice(context.transform);
    sinon.assert.calledWithExactly(context.transform, jsAstsOriginal[1], mutantCollector, { ...context, options: expectedOptions });
    sinon.assert.calledWithExactly(context.transform, jsAstsOriginal[2], mutantCollector, { ...context, options: expectedOptions });
  });

  describe('header placement', () => {
    it('should not place a header when no mutants were added', () => {
      // Act
      const input = createSvelteAst();

      // Act
      transformSvelte(createSvelteAst(), new MutantCollector(), transformerContextStub());

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
        range: createRange(moduleScriptStart.length, moduleScriptStart.length + moduleScriptContent.length),
      });
      const jsTemplateScript = createJSAst({ rawContent: templateScriptContent });
      const templateNode = createTemplateScript({ ast: jsTemplateScript, range: createRange(28, 33), isExpression: true });
      const svelteAst = createSvelteAst({ rawContent: svelte, root: { moduleScript: moduleScriptSvelteNode, additionalScripts: [templateNode] } });
      const mutantCollector = new MutantCollector();
      const context = transformerContextStub();
      context.transform.withArgs(jsModule, sinon.match.any, sinon.match.any).callsFake(() => {
        mutantCollector.collect(svelteAst.originFileName, jsModule.root.program, {
          mutatorName: 'test',
          replacement: types.binaryExpression('-', types.numericLiteral(1), types.numericLiteral(1)),
        });
      });

      // Act
      transformSvelte(svelteAst, mutantCollector, context);

      // Assert
      expect(svelteAst.root.moduleScript!.ast.rawContent).eq(moduleScriptContent); // unchanged
      expect(svelteAst.root.moduleScript!.ast.root.program.body).length(5);
      expect(svelteAst.root.moduleScript!.ast.root.program.body.slice(0, 4)).deep.eq(instrumentationBabelHeader);
    });

    it('should place the instrumentation header in an invented script module when the module script is absent', () => {
      // Arrange & Act
      const { svelteAst, rawContent } = arrangeAndActTransformWithMutantsWithoutModuleScript();

      // Assert
      expect(svelteAst.root.moduleScript).ok;
      const moduleScript = svelteAst.root.moduleScript!;
      expect(svelteAst.rawContent).eq(`<script context="module">\n\n</script>\n${rawContent}`);
      expect(moduleScript.ast.rawContent).eq('');
      expect(moduleScript.ast.root.program.body).length(4);
      expect(moduleScript.ast.root.program.body).deep.eq(instrumentationBabelHeader);
      expect(moduleScript.isExpression).false;
    });

    it('should offset the start and end location of additional script tags', () => {
      // Arrange & Act
      const { svelteAst } = arrangeAndActTransformWithMutantsWithoutModuleScript();

      // Assert
      expect(svelteAst.root.additionalScripts).lengthOf(1);
      const expectedRange: Range = { start: 48, end: 51 }; // = range + offset of the module script
      expect(svelteAst.root.additionalScripts[0].range).deep.eq(expectedRange);
    });

    function arrangeAndActTransformWithMutantsWithoutModuleScript() {
      const templateScriptContent = 'foo';
      const rawContent = `<h1>hello!{${templateScriptContent}}</h1>`;
      const jsTemplateScript = createJSAst({ rawContent: templateScriptContent });
      const templateNode = createTemplateScript({ ast: jsTemplateScript, range: createRange(11, 14), isExpression: true });
      const svelteAst = createSvelteAst({ rawContent: rawContent, root: { additionalScripts: [templateNode] } });
      const mutantCollector = new MutantCollector();
      const context = transformerContextStub();
      context.transform.withArgs(jsTemplateScript, sinon.match.any, sinon.match.any).callsFake(() => {
        mutantCollector.collect(svelteAst.originFileName, jsTemplateScript.root.program, {
          mutatorName: 'bar',
          replacement: types.identifier('bar'),
        });
      });
      transformSvelte(svelteAst, mutantCollector, context);
      return { rawContent, svelteAst };
    }
  });
});
