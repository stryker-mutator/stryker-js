import * as fs from 'fs';
import * as path from 'path';

import { File, StrykerOptions } from '@stryker-mutator/api/core';
import { testInjector, factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { CONFIG_KEY } from '../../src/helpers/keys';
import TypescriptOptionsEditor from '../../src/TypescriptOptionsEditor';
import TypescriptTranspiler from '../../src/TypescriptTranspiler';

describe('AllowJS integration', () => {
  let options: StrykerOptions;
  let inputFiles: File[];

  beforeEach(() => {
    const optionsEditor = testInjector.injector.injectClass(TypescriptOptionsEditor);
    options = factory.strykerOptions();
    options.tsconfigFile = path.resolve(__dirname, '..', '..', 'testResources', 'allowJS', 'tsconfig.json');
    optionsEditor.edit(options);
    inputFiles = options[CONFIG_KEY].fileNames.map((fileName: string) => new File(fileName, fs.readFileSync(fileName, 'utf8')));
  });

  it('should be able to transpile source code', async () => {
    const transpiler = new TypescriptTranspiler(options, /*produceSourceMaps: */ false, () => testInjector.logger);
    const outputFiles = await transpiler.transpile(inputFiles);
    expect(outputFiles.length).to.eq(2);
    expect(outputFiles.map((f) => f.name)).deep.eq([
      path.resolve(__dirname, '..', '..', 'testResources', 'allowJS', 'dist', 'math.js'),
      path.resolve(__dirname, '..', '..', 'testResources', 'allowJS', 'dist', 'useMath.js'),
    ]);
  });
});
