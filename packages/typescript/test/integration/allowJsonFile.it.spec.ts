import * as fs from 'fs';
import * as path from 'path';

import { File } from '@stryker-mutator/api/core';
import { testInjector, factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import { ParsedCommandLine } from 'typescript';

import TypescriptOptionsEditor from '../../src/TypescriptOptionsEditor';
import TypescriptTranspiler from '../../src/TypescriptTranspiler';
import { TypescriptWithStrykerOptions } from '../../src/TypescriptWithStrykerOptions';

describe('AllowJsonFiles integration', () => {
  let options: TypescriptWithStrykerOptions;
  let inputFiles: File[];

  beforeEach(() => {
    const optionsEditor = testInjector.injector.injectClass(TypescriptOptionsEditor);
    options = factory.strykerOptions();
    options.tsconfigFile = path.resolve(__dirname, '..', '..', 'testResources', 'allowJsonFiles', 'tsconfig.json');
    optionsEditor.edit(options);
    inputFiles = (options.tsconfig!.fileNames as string[]).map((fileName) => new File(fileName, fs.readFileSync(fileName, 'utf8')));
  });

  it('should be able to transpile source code', async () => {
    const transpiler = new TypescriptTranspiler(options, /*produceSourceMaps: */ false, () => testInjector.logger);
    const outputFiles = await transpiler.transpile(inputFiles);
    expect(outputFiles.length).to.eq(2);
    expect(outputFiles.map((f) => f.name)).deep.eq([
      path.resolve(__dirname, '..', '..', 'testResources', 'allowJsonFiles', 'json.json'),
      path.resolve(__dirname, '..', '..', 'testResources', 'allowJsonFiles', 'index.js'),
    ]);
  });

  it('should be able to transpile source code to outDir', async () => {
    ((options.tsconfig as unknown) as ParsedCommandLine).options.outDir = 'dist';
    const transpiler = new TypescriptTranspiler(options, /*produceSourceMaps: */ false, () => testInjector.logger);
    const outputFiles = await transpiler.transpile(inputFiles);
    expect(outputFiles.length).to.eq(2);
    expect(outputFiles.map((f) => f.name)).deep.eq([path.join('dist', 'index.js'), path.join('dist', 'json.json')]);
  });
});
