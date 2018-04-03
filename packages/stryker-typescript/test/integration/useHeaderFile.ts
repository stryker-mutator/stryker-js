import * as path from 'path';
import * as fs from 'fs';
import { expect } from 'chai';
import { Config } from 'stryker-api/config';
import { File } from 'stryker-api/core';
import TypescriptConfigEditor from '../../src/TypescriptConfigEditor';
import TypescriptTranspiler from '../../src/TypescriptTranspiler';
import { setGlobalLogLevel } from 'log4js';
import { CONFIG_KEY } from '../../src/helpers/keys';

describe('Use header file integration', function () {
  this.timeout(10000);
  let config: Config;  
  let inputFiles: File[];
  
  beforeEach(() => {
    setGlobalLogLevel('error');
    const configEditor = new TypescriptConfigEditor();
    config = new Config();
    config.set({
      tsconfigFile: path.resolve(__dirname, '..', '..', 'testResources', 'useHeaderFile', 'tsconfig.json'),
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
  });
});