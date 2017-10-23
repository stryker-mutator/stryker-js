import * as path from 'path';
import * as fs from 'fs';
import { expect } from 'chai';
import { Config } from 'stryker-api/config';
import { TextFile } from 'stryker-api/core';
import TypescriptConfigEditor from '../../src/TypescriptConfigEditor';
import TypescriptTranspiler from '../../src/TypescriptTranspiler';
import { textFile } from '../helpers/producers';
import { setGlobalLogLevel } from 'log4js';

describe('stryker-typescript', function () {
  this.timeout(10000);

  let config: Config;
  let inputFiles: TextFile[];

  beforeEach(() => {
    setGlobalLogLevel('error');
    const configEditor = new TypescriptConfigEditor();
    config = new Config();
    config.set({
      tsconfigFile: path.resolve(__dirname, '..', '..', 'tsconfig.json'),
    });
    configEditor.edit(config);
    inputFiles = config.files.map((file): TextFile => (textFile({
      name: file as string,
      content: fs.readFileSync(file as string, 'utf8')
    })));
  });

  afterEach(() => {
    setGlobalLogLevel('trace');
  });

  it('should be able to transpile itself', async () => {
    const transpiler = new TypescriptTranspiler({ config, keepSourceMaps: true });
    const transpileResult = await transpiler.transpile(inputFiles);
    expect(transpileResult.error).to.be.null;
    const outputFiles = transpileResult.outputFiles;
    expect(outputFiles.length).greaterThan(10);
  });

  it('should result in an error if a variable is declared as any and noImplicitAny = true', async () => {
    const transpiler = new TypescriptTranspiler({ config, keepSourceMaps: true });
    inputFiles[0].content += 'function foo(bar) { return bar; } ';
    const transpileResult = await transpiler.transpile(inputFiles);
    expect(transpileResult.error).contains('error TS7006: Parameter \'bar\' implicitly has an \'any\' type');
    expect(transpileResult.outputFiles.length).eq(0);
  });

  it('should not result in an error if a variable is declared as any and noImplicitAny = false', async () => {
    config['tsconfig'].noImplicitAny = false;
    inputFiles[0].content += 'const shouldResultInError = 3';
    const transpiler = new TypescriptTranspiler({ config, keepSourceMaps: true });
    const transpileResult = await transpiler.transpile(inputFiles);
    expect(transpileResult.error).null;
  });
});