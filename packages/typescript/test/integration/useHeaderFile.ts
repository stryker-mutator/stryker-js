import * as fs from 'fs';
import * as path from 'path';

import { File, StrykerOptions } from '@stryker-mutator/api/core';
import { commonTokens } from '@stryker-mutator/api/plugin';
import { testInjector, factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { CONFIG_KEY } from '../../src/helpers/keys';
import TypescriptOptionsEditor from '../../src/TypescriptOptionsEditor';
import TypescriptTranspiler from '../../src/TypescriptTranspiler';

describe('Use header file integration', () => {
  let options: StrykerOptions;
  let inputFiles: File[];
  let transpiler: TypescriptTranspiler;

  beforeEach(() => {
    const optionsEditor = testInjector.injector.injectClass(TypescriptOptionsEditor);
    options = factory.strykerOptions();
    options.tsconfigFile = path.resolve(__dirname, '..', '..', 'testResources', 'useHeaderFile', 'tsconfig.json');
    optionsEditor.edit(options);
    inputFiles = options[CONFIG_KEY].fileNames.map((fileName: string) => new File(fileName, fs.readFileSync(fileName, 'utf8')));
    transpiler = testInjector.injector
      .provideValue(commonTokens.produceSourceMaps, false)
      .provideValue(commonTokens.options, options)
      .injectClass(TypescriptTranspiler);
  });

  it('should be able to transpile source code', async () => {
    const outputFiles = await transpiler.transpile(inputFiles);
    expect(outputFiles.length).to.eq(2);
  });
});
