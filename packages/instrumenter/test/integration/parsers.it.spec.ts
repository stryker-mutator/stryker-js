import { promises as fs } from 'fs';
import path from 'path';

import { expect } from 'chai';

import { createParser, ParserOptions } from '../../src/parsers';
import { AstFormat, HtmlAst, TSAst, JSAst, Ast } from '../../src/syntax';
import { createParserOptions } from '../helpers/factories';

const resolveTestResource = path.resolve.bind(path, __dirname, '..' /* integration */, '..' /* test */, '..' /* dist */, 'testResources', 'parser');

describe('parsers integration', () => {
  it('should allow to parse html with script tags', async () => {
    const actual = await actAssertHtml('index.html');
    expect(actual.root.scripts).lengthOf(2);
    expect(actual).to.matchSnapshot();
  });

  it('should allow to parse a *.vue file', async () => {
    const actual = await actAssertHtml('App.vue');
    expect(actual.format).eq(AstFormat.Html);
    expect(actual.root.scripts).lengthOf(1);
    expect(actual).to.matchSnapshot();
  });

  it('should allow to parse a an angular file', async () => {
    const actual = await actAssertTS('app.component.ts');
    expect(actual).to.matchSnapshot();
  });

  it('should allow to parse a tsx file', async () => {
    const actual = await actAssertTS('App.tsx');
    expect(actual).to.matchSnapshot();
  });

  it('should allow to parse a react file with custom babelrc file', async () => {
    const actual = await actAssertJS('jsx-with-babelrc/Badge.js');
    expect(actual).to.matchSnapshot();
  });

  it('should allow to parse a react file with project-wide configuration file', async () => {
    process.chdir(resolveTestResource('jsx-with-project-wide-config'));
    const actual = await actAssertJS('jsx-with-project-wide-config/src/Badge.js');
    expect(actual).to.matchSnapshot();
  });

  it('should ignore configuration when parsing ts files', async () => {
    process.chdir(resolveTestResource('ts-in-babel-project'));
    const actual = await actAssertTS('ts-in-babel-project/src/app.ts');
    expect(actual).to.matchSnapshot();
  });

  it('should allow a plugin that conflicts with the default plugins as long as plugins are emptied out', async () => {
    process.chdir(resolveTestResource('js-in-babel-project'));
    const actual = await actAssertJS('js-in-babel-project/src/app.js', createParserOptions({ plugins: [] }));
    expect(actual).to.matchSnapshot();
  });

  it('should allow to parse a mjs file', async () => {
    const actual = await actAssertJS('app.mjs');
    expect(actual).to.matchSnapshot();
  });

  it('should allow to parse a cjs file', async () => {
    const actual = await actAssertJS('app.cjs');
    expect(actual).to.matchSnapshot();
  });

  async function act(testResourceFileName: string, options: ParserOptions) {
    const fileName = resolveTestResource(testResourceFileName);
    const input = await fs.readFile(fileName, 'utf8');
    const actual = await createParser(options)(input, fileName);
    cleanFileName(actual, testResourceFileName);
    return actual;
  }
  async function actAssertHtml(testResourceFileName: string, options = createParserOptions()): Promise<HtmlAst> {
    const actual = await act(testResourceFileName, options);
    expect(actual.format).eq(AstFormat.Html);
    return actual as HtmlAst;
  }
  async function actAssertTS(testResourceFileName: string, options = createParserOptions()): Promise<TSAst> {
    const actual = await act(testResourceFileName, options);
    expect(actual.format).eq(AstFormat.TS);
    return actual as TSAst;
  }
  async function actAssertJS(testResourceFileName: string, options = createParserOptions()): Promise<JSAst> {
    const actual = await act(testResourceFileName, options);
    expect(actual.format).eq(AstFormat.JS);
    return actual as JSAst;
  }

  /**
   * Reset the file name, so snapshots are the same locally as in ci/cd
   */
  function cleanFileName(ast: Ast, fileNameOverride: string) {
    ast.originFileName = fileNameOverride;
    switch (ast.format) {
      case AstFormat.Html:
        ast.root.scripts.forEach((script) => {
          script.originFileName = fileNameOverride;
        });
    }
  }
});
