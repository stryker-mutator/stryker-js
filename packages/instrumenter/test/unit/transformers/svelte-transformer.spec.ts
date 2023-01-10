import { expect } from 'chai';
import sinon from 'sinon';

import { transformBabel } from '../../../src/transformers/babel-transformer.js';

import { MutantCollector } from '../../../src/transformers/mutant-collector.js';

import { transformSvelte } from '../../../src/transformers/svelte-transformer.js';
import { createJSAst, createSvelteAst, createSvelteNode } from '../../helpers/factories.js';
import { transformerContextStub } from '../../helpers/stubs.js';

describe('svelte-transformer', () => {
  it('should transform the svelte file', () => {
    const script = 'let name = "test"';
    const svelte = `<script>${script}</script><h1>hello!</h1>`;
    const jsAstOriginal = createJSAst({ rawContent: script });
    const jsAst = createJSAst({ rawContent: script });
    const svelteScriptTag = createSvelteNode(jsAst, 8, 25);
    const svelteAst = createSvelteAst({ rawContent: svelte, root: { mainScript: svelteScriptTag, additionalScripts: [] } });

    const mutantCollector = new MutantCollector();
    const context = transformerContextStub();

    context.transform.withArgs(jsAst, sinon.match.any, sinon.match.any);
    transformBabel(jsAst, mutantCollector, context);

    transformSvelte(svelteAst, mutantCollector, context);

    expect(svelteAst.root.mainScript).not.eq(jsAstOriginal);
    expect(context.transform).callCount(1);
    expect(mutantCollector.mutants).lengthOf(1);
    expect(svelteAst.root.mainScript.ast.root.program.body).length(5);
  });

  it('should transform the svelte file with additional scripts', () => {
    const scripts = ['let name = "test"', 'let age = 20', '1 + 2'];
    const svelte = `<script>${scripts[0]}</script>
    <script context="module">${scripts[1]}</script>
    <h1>hello {${scripts[2]}}</h1>`;
    const jsAstsOriginal = scripts.map((script) => createJSAst({ rawContent: script }));
    const svelteNodes = [
      createSvelteNode(jsAstsOriginal[0], 8, 25),
      createSvelteNode(jsAstsOriginal[1], 50, 67),
      createSvelteNode(jsAstsOriginal[2], 78, 83),
    ];

    const svelteAst = createSvelteAst({ rawContent: svelte, root: { mainScript: svelteNodes[0], additionalScripts: [...svelteNodes.slice(1)] } });

    const mutantCollector = new MutantCollector();
    const context = transformerContextStub();

    const jsAstsTransformed = jsAstsOriginal.map((script) => transformBabel(script, mutantCollector, context));

    context.transform
      .withArgs(jsAstsOriginal[0], sinon.match.any, sinon.match.any)
      .resolves(jsAstsTransformed[0])
      .withArgs(jsAstsOriginal[1], sinon.match.any, sinon.match.any)
      .resolves(jsAstsTransformed[1])
      .withArgs(jsAstsOriginal[2], sinon.match.any, sinon.match.any)
      .resolves(jsAstsTransformed[2]);

    transformSvelte(svelteAst, mutantCollector, context);

    expect(svelteAst.root.mainScript).not.eq(jsAstsOriginal[0]);
    expect(context.transform).callCount(3);
    expect(mutantCollector.mutants).lengthOf(2);
    //expect(svelteAst.root.additionalScripts).eq(jsAstsTransformed.slice(1));
  });

  it('Should place header in empty script tag when there is a mutant', () => {
    const binding = '1 + 2';
    const svelte = `<script></script><h1>hello!{${binding}}</h1>`;
    const jsAstMainScript = createJSAst({ rawContent: '' });
    const mainScriptSvelteNode = createSvelteNode(jsAstMainScript, 8, 9);
    const jsAstBinding = createJSAst({ rawContent: binding });
    const svelteNode = createSvelteNode(jsAstBinding, 28, 33);
    const svelteAst = createSvelteAst({ rawContent: svelte, root: { mainScript: mainScriptSvelteNode, additionalScripts: [svelteNode] } });

    const mutantCollector = new MutantCollector();
    const context = transformerContextStub();

    transformBabel(jsAstBinding, mutantCollector, context);
    transformBabel(jsAstMainScript, mutantCollector, context);

    context.transform.withArgs(jsAstMainScript, sinon.match.any, sinon.match.any).resolves(jsAstMainScript);
    context.transform.withArgs(jsAstBinding, sinon.match.any, sinon.match.any).resolves(jsAstBinding);

    transformSvelte(svelteAst, mutantCollector, context);

    expect(svelteAst.root.mainScript.ast.rawContent).eq('');
    expect(svelteAst.root.mainScript.ast.root.program.body).length(4);
  });
});
