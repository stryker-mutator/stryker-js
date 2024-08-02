import { promises as fsPromises } from 'fs';

import { expect } from 'chai';

import { createParser, ParserOptions } from '../../src/parsers/index.js';
import { AstFormat, HtmlAst, TSAst, JSAst, Ast } from '../../src/syntax/index.js';
import { createParserOptions } from '../helpers/factories.js';
import { resolveTestResource } from '../helpers/resolve-test-resource.js';

const resolveParserTestResource = resolveTestResource.bind(null, 'parser');

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
    const actual = await actAssertTsx('App.tsx');
    expect(actual).to.matchSnapshot();
  });
  it('should allow to parse a mts file', async () => {
    const actual = await actAssertTS('app.mts');
    expect(actual).to.matchSnapshot();
  });
  it('should allow to parse a cts file', async () => {
    const actual = await actAssertTS('app.cts');
    expect(actual).to.matchSnapshot();
  });

  it('should allow to parse a react file with custom babelrc file', async () => {
    const actual = await actAssertJS('jsx-with-babelrc/Badge.js');
    expect(actual).to.matchSnapshot();
  });

  it('should allow to parse a react file with project-wide configuration file', async () => {
    process.chdir(resolveParserTestResource('jsx-with-project-wide-config'));
    const actual = await actAssertJS('jsx-with-project-wide-config/src/Badge.js');
    expect(actual).to.matchSnapshot();
  });

  it('should ignore configuration when parsing ts files', async () => {
    process.chdir(resolveParserTestResource('ts-in-babel-project'));
    const actual = await actAssertTS('ts-in-babel-project/src/app.ts');
    expect(actual).to.matchSnapshot();
  });

  it('should be able to parse a ts file with more recent TS features', async () => {
    const actual = await actAssertTS('new-ts-features.ts');
    expect(actual).to.matchSnapshot();
  });

  it('should allow a plugin that conflicts with the default plugins as long as plugins are emptied out', async () => {
    process.chdir(resolveParserTestResource('js-in-babel-project'));
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
    const fileName = resolveParserTestResource(testResourceFileName);
    const input = await fsPromises.readFile(fileName, 'utf8');
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
  async function actAssertTsx(testResourceFileName: string, options = createParserOptions()): Promise<TSAst> {
    const actual = await act(testResourceFileName, options);
    expect(actual.format).eq(AstFormat.Tsx);
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
    if (ast.format === AstFormat.Html) {
      ast.root.scripts.forEach((script) => {
        script.originFileName = fileNameOverride;
      });
    }
  }
});
