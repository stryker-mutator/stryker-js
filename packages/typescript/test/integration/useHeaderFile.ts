import { Config } from '@stryker-mutator/api/config';
import { File } from '@stryker-mutator/api/core';
import { commonTokens } from '@stryker-mutator/api/plugin';
import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import { CONFIG_KEY } from '../../src/helpers/keys';
import TypescriptConfigEditor from '../../src/TypescriptConfigEditor';
import TypescriptTranspiler from '../../src/TypescriptTranspiler';

describe('Use header file integration', () => {

  let config: Config;
  let inputFiles: File[];
  let transpiler: TypescriptTranspiler;

  beforeEach(() => {
    const configEditor = testInjector.injector.injectClass(TypescriptConfigEditor);
    config = new Config();
    config.set({
      tsconfigFile: path.resolve(__dirname, '..', '..', 'testResources', 'useHeaderFile', 'tsconfig.json'),
    });
    configEditor.edit(config);
    inputFiles = config[CONFIG_KEY].fileNames.map((fileName: string) => new File(fileName, fs.readFileSync(fileName, 'utf8')));
    transpiler = testInjector.injector
      .provideValue(commonTokens.produceSourceMaps, false)
      .provideValue(commonTokens.options, config)
      .injectClass(TypescriptTranspiler);
  });

  it('should be able to transpile source code', async () => {
    const outputFiles = await transpiler.transpile(inputFiles);
    expect(outputFiles.length).to.eq(2);
  });
});
