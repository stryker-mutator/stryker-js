import * as fs from 'fs';
import * as path from 'path';

import { File, StrykerOptions } from '@stryker-mutator/api/core';
import { testInjector, factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { CONFIG_KEY } from '../../src/helpers/keys';
import TypescriptOptionsEditor from '../../src/TypescriptOptionsEditor';
import TypescriptTranspiler from '../../src/TypescriptTranspiler';

describe('@stryker-mutator/typescript', () => {
  let options: StrykerOptions;
  let inputFiles: File[];

  beforeEach(() => {
    const optionsEditor = testInjector.injector.injectClass(TypescriptOptionsEditor);
    options = factory.strykerOptions();
    options.tsconfigFile = path.resolve(__dirname, '..', '..', 'tsconfig.src.json');
    optionsEditor.edit(options);
    inputFiles = options[CONFIG_KEY].fileNames.map((fileName: string) => new File(fileName, fs.readFileSync(fileName, 'utf8')));
  });

  it('should be able to transpile itself', async () => {
    const transpiler = new TypescriptTranspiler(options, /*produceSourceMaps: */ true, () => testInjector.logger);
    const outputFiles = await transpiler.transpile(inputFiles);
    expect(outputFiles.length).greaterThan(10);
  });

  it('should result in an error if a variable is declared as any and noImplicitAny = true', async () => {
    const transpiler = new TypescriptTranspiler(options, /*produceSourceMaps: */ true, () => testInjector.logger);
    inputFiles[0] = new File(inputFiles[0].name, inputFiles[0].textContent + 'function foo(bar) { return bar; } ');
    return expect(transpiler.transpile(inputFiles)).rejectedWith("error TS7006: Parameter 'bar' implicitly has an 'any' type");
  });

  it('should not result in an error if a variable is declared as any and noImplicitAny = false', async () => {
    options.tsconfig.noImplicitAny = false;
    inputFiles[0] = new File(inputFiles[0].name, inputFiles[0].textContent + 'const shouldResultInError = 3');
    const transpiler = new TypescriptTranspiler(options, /*produceSourceMaps: */ true, () => testInjector.logger);
    const outputFiles = await transpiler.transpile(inputFiles);
    expect(outputFiles).lengthOf.greaterThan(0);
  });
});
