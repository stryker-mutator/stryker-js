import { promises as fsPromises } from 'fs';

import { expect } from 'chai';
import sinon from 'sinon';
import { notEmpty } from '@stryker-mutator/util';

import { parse } from '../../../src/parsers/vue-parser.js';
import { parse as htmlParse } from '../../../src/parsers/html-parser.js';
import { createParser } from '../../../src/parsers/index.js';
import { ParserContext } from '../../../src/parsers/parser-context.js';
import { AstFormat, Range } from '../../../src/syntax/index.js';
import {
  createJSAst,
  createParserOptions,
  createTSAst,
} from '../../helpers/factories.js';
import { parserContextStub } from '../../helpers/stubs.js';
import { resolveTestResource } from '../../helpers/resolve-test-resource.js';

const resolveParserTestResource = resolveTestResource.bind(null, 'parser');

describe('vue-parser', () => {
  let contextStub: sinon.SinonStubbedInstance<ParserContext>;

  beforeEach(() => {
    contextStub = parserContextStub();
  });

  describe('script block classification', () => {
    it('should use a single plain script as the module script', async () => {
      const script = 'const name = "test"';
      contextStub.parse.resolves(createJSAst({ rawContent: script }));

      const actual = await parse(
        `<script>${script}</script><h1>hello!</h1>`,
        'App.vue',
        contextStub,
      );

      expect(actual.format).eq(AstFormat.Vue);
      expect(actual.root.moduleScript!.ast.rawContent).eq(script);
      expect(actual.root.additionalScripts).lengthOf(0);
      expect(actual.root.setup).undefined;
    });

    it('should not use a `<script setup>` as the module script', async () => {
      const script = 'const name = "test"';
      contextStub.parse.resolves(createJSAst({ rawContent: script }));

      const actual = await parse(
        `<script setup>${script}</script><h1>hello!</h1>`,
        'App.vue',
        contextStub,
      );

      expect(actual.root.moduleScript).undefined;
      expect(actual.root.additionalScripts).lengthOf(1);
      expect(actual.root.setup!.script).eq(actual.root.additionalScripts[0]);
    });

    it('should use the plain script as the module script when it comes first', async () => {
      const moduleScript = 'export default {}';
      const setupScript = 'const name = "test"';
      contextStub.parse
        .withArgs(moduleScript)
        .resolves(createJSAst({ rawContent: moduleScript }))
        .withArgs(setupScript)
        .resolves(createJSAst({ rawContent: setupScript }));

      const actual = await parse(
        `<script>${moduleScript}</script><script setup>${setupScript}</script>`,
        'App.vue',
        contextStub,
      );

      expect(actual.root.moduleScript!.ast.rawContent).eq(moduleScript);
      expect(actual.root.additionalScripts).lengthOf(1);
      expect(actual.root.additionalScripts[0].ast.rawContent).eq(setupScript);
      expect(actual.root.setup!.script).eq(actual.root.additionalScripts[0]);
    });

    it('should use the plain script as the module script when `<script setup>` comes first', async () => {
      const moduleScript = 'export default {}';
      const setupScript = 'const name = "test"';
      contextStub.parse
        .withArgs(moduleScript)
        .resolves(createJSAst({ rawContent: moduleScript }))
        .withArgs(setupScript)
        .resolves(createJSAst({ rawContent: setupScript }));

      const actual = await parse(
        `<script setup>${setupScript}</script><script>${moduleScript}</script>`,
        'App.vue',
        contextStub,
      );

      expect(actual.root.moduleScript!.ast.rawContent).eq(moduleScript);
      expect(actual.root.additionalScripts).lengthOf(1);
      expect(actual.root.additionalScripts[0].ast.rawContent).eq(setupScript);
      expect(actual.root.setup!.script).eq(actual.root.additionalScripts[0]);
    });

    it('should mark every script as a non-expression', async () => {
      const script = 'const name = "test"';
      contextStub.parse.resolves(createJSAst({ rawContent: script }));

      const actual = await parse(
        `<script>${script}</script><script setup>${script}</script>`,
        'App.vue',
        contextStub,
      );

      expect(actual.root.moduleScript!.isExpression).false;
      expect(actual.root.additionalScripts[0].isExpression).false;
    });

    it('should classify the `<script setup>` of the AppScriptSetup.vue test resource', async () => {
      const fileName = resolveParserTestResource('AppScriptSetup.vue');
      const content = await fsPromises.readFile(fileName, 'utf8');

      const actual = await parse(content, fileName, realParserContext());

      expect(actual.root.moduleScript).undefined;
      expect(actual.root.additionalScripts).lengthOf(1);
      expect(actual.root.setup!.script).eq(actual.root.additionalScripts[0]);
      expect(actual.root.setup!.lang).undefined;
      expect(actual.root.setup!.script.ast.format).eq(AstFormat.JS);
    });
  });

  describe('lang attribute of `<script setup>`', () => {
    it('should keep the raw lang', async () => {
      const script = 'const name: string = "test"';
      contextStub.parse.resolves(createTSAst({ rawContent: script }));

      const actual = await parse(
        `<script setup lang="ts">${script}</script>`,
        'App.vue',
        contextStub,
      );

      expect(actual.root.setup!.lang).eq('ts');
      expect(actual.root.setup!.script.ast.format).eq(AstFormat.TS);
    });

    it('should keep the raw lang casing', async () => {
      const script = 'const name: string = "test"';
      contextStub.parse.resolves(createTSAst({ rawContent: script }));

      const actual = await parse(
        `<script setup lang="TS">${script}</script>`,
        'App.vue',
        contextStub,
      );

      expect(actual.root.setup!.lang).eq('TS');
      expect(actual.root.setup!.script.ast.format).eq(AstFormat.TS);
    });

    it('should not report a lang when the `<script setup>` has none', async () => {
      const script = 'const name = "test"';
      contextStub.parse.resolves(createJSAst({ rawContent: script }));

      const actual = await parse(
        `<script setup>${script}</script>`,
        'App.vue',
        contextStub,
      );

      expect(actual.root.setup!.lang).undefined;
    });
  });

  describe('script format', () => {
    it('should parse a `lang="tsx"` script as tsx', async () => {
      const script = 'const app = <div />';

      await parse(
        `<script setup lang="tsx">${script}</script>`,
        'App.vue',
        contextStub,
      );

      expect(contextStub.parse).calledWith(script, 'App.vue', AstFormat.Tsx);
    });

    it('should skip a script with a "src" attribute', async () => {
      const actual = await parse(
        '<script setup src="./app.js"></script>',
        'App.vue',
        contextStub,
      );

      expect(contextStub.parse).not.called;
      expect(actual.root.moduleScript).undefined;
      expect(actual.root.additionalScripts).lengthOf(0);
      expect(actual.root.setup).undefined;
    });

    it('should silently skip a script with an unrecognized lang', async () => {
      const actual = await parse(
        '<script setup lang="coffee">x = 1</script>',
        'App.vue',
        contextStub,
      );

      expect(contextStub.parse).not.called;
      expect(actual.root.additionalScripts).lengthOf(0);
      expect(actual.root.setup).undefined;
    });

    it('should parse a script without a lang or type as js', async () => {
      const script = 'const name = "test"';

      await parse(`<script>${script}</script>`, 'App.vue', contextStub);

      expect(contextStub.parse).calledWith(script, 'App.vue', AstFormat.JS);
    });
  });

  it('should keep both blocks of an SFC with two plain scripts', async () => {
    const first = 'export default {}';
    const second = 'window.foo = 42';
    contextStub.parse
      .withArgs(first)
      .resolves(createJSAst({ rawContent: first }))
      .withArgs(second)
      .resolves(createJSAst({ rawContent: second }));

    const actual = await parse(
      `<script>${first}</script><script>${second}</script>`,
      'App.vue',
      contextStub,
    );

    expect(actual.root.moduleScript!.ast.rawContent).eq(first);
    expect(actual.root.additionalScripts).lengthOf(1);
    expect(actual.root.additionalScripts[0].ast.rawContent).eq(second);
    expect(actual.root.setup).undefined;
  });

  it('should report the same script ranges as the html parser', async () => {
    const fileName = resolveParserTestResource('App.vue');
    const content = await fsPromises.readFile(fileName, 'utf8');
    const context = realParserContext();

    const vueAst = await parse(content, fileName, context);
    const htmlAst = await htmlParse(content, fileName, context);

    const expectedRanges: Range[] = htmlAst.root.scripts.map(({ root }) => ({
      start: root.start!,
      end: root.end!,
    }));
    expect(expectedRanges).lengthOf(1);
    expect(
      [vueAst.root.moduleScript, ...vueAst.root.additionalScripts]
        .filter(notEmpty)
        .map(({ range }) => range),
    ).deep.eq(expectedRanges);
  });

  function realParserContext(): ParserContext {
    return { parse: createParser(createParserOptions()) };
  }
});
