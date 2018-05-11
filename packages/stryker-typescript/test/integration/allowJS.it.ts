import * as path from 'path';
import * as fs from 'fs';
import { Config } from 'stryker-api/config';
import TypescriptConfigEditor from '../../src/TypescriptConfigEditor';
import { setGlobalLogLevel } from 'log4js';
import { File } from 'stryker-api/core';
import { CONFIG_KEY } from '../../src/helpers/keys';
import TypescriptTranspiler from '../../src/TypescriptTranspiler';
import { expect } from 'chai';

describe('AllowJS integration', function () {
  this.timeout(10000);

  let config: Config;
  let inputFiles: File[];

  beforeEach(() => {
    setGlobalLogLevel('error');
    const configEditor = new TypescriptConfigEditor();
    config = new Config();
    config.set({
      tsconfigFile: path.resolve(__dirname, '..', '..', 'testResources', 'allowJS', 'tsconfig.json'),
    });
    configEditor.edit(config);
    inputFiles = config[CONFIG_KEY].fileNames.map((fileName: string) => new File(fileName, fs.readFileSync(fileName, 'utf8')));
  });

  afterEach(() => {
    setGlobalLogLevel('trace');
  });
  
  it('should be able to transpile source code', async () => {
    const transpiler = new TypescriptTranspiler({ config, produceSourceMaps: false });
    const outputFiles = await transpiler.transpile(inputFiles);
    expect(outputFiles.length).to.eq(2);
    expect(outputFiles.map(f => f.name)).deep.eq([
      path.resolve(__dirname, '..', '..', 'testResources', 'allowJS', 'dist', 'math.js'),
      path.resolve(__dirname, '..', '..', 'testResources', 'allowJS', 'dist', 'useMath.js')
    ]);
  });
});
