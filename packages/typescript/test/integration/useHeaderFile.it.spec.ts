import * as fs from 'fs';
import * as path from 'path';

import { File } from '@stryker-mutator/api/core';
import { commonTokens } from '@stryker-mutator/api/plugin';
import { testInjector, factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import TypescriptOptionsEditor from '../../src/TypescriptOptionsEditor';
import TypescriptTranspiler from '../../src/TypescriptTranspiler';
import { TypescriptWithStrykerOptions } from '../../src/TypescriptWithStrykerOptions';

describe('Use header file integration', () => {
  let options: TypescriptWithStrykerOptions;
  let inputFiles: File[];
  let transpiler: TypescriptTranspiler;

  beforeEach(() => {
    const optionsEditor = testInjector.injector.injectClass(TypescriptOptionsEditor);
    options = factory.strykerOptions();
    options.tsconfigFile = path.resolve(__dirname, '..', '..', 'testResources', 'useHeaderFile', 'tsconfig.json');
    optionsEditor.edit(options);
    inputFiles = (options.tsconfig!.fileNames as string[]).map((fileName) => new File(fileName, fs.readFileSync(fileName, 'utf8')));
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
