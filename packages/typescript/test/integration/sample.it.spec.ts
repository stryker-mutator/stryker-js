import * as fs from 'fs';
import * as path from 'path';

import { Config } from '@stryker-mutator/api/config';
import { File } from '@stryker-mutator/api/core';
import { Mutant } from '@stryker-mutator/api/mutant';
import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { CONFIG_KEY } from '../../src/helpers/keys';
import TypescriptConfigEditor from '../../src/TypescriptConfigEditor';
import { typescriptMutatorFactory } from '../../src/TypescriptMutator';
import TypescriptTranspiler from '../../src/TypescriptTranspiler';

describe('Sample integration', () => {
  let config: Config;
  let inputFiles: File[];

  beforeEach(() => {
    const configEditor = testInjector.injector.injectClass(TypescriptConfigEditor);
    config = new Config();
    config.set({
      tsconfigFile: path.resolve(__dirname, '..', '..', 'testResources', 'sampleProject', 'tsconfig.json')
    });
    configEditor.edit(config);
    inputFiles = config[CONFIG_KEY].fileNames.map((fileName: string) => new File(fileName, fs.readFileSync(fileName, 'utf8')));
    testInjector.options = config;
  });

  it('should be able to generate mutants', () => {
    // Generate mutants
    const mutator = testInjector.injector.injectFunction(typescriptMutatorFactory);
    const mutants = mutator.mutate(inputFiles);
    expect(mutants.length).to.eq(6);
  });

  it('should be able to transpile source code', async () => {
    const transpiler = new TypescriptTranspiler(config, /*produceSourceMaps: */ false, () => testInjector.logger);
    const outputFiles = await transpiler.transpile(inputFiles);
    expect(outputFiles.length).to.eq(2);
  });

  it('should be able to produce source maps', async () => {
    const transpiler = new TypescriptTranspiler(config, /*produceSourceMaps: */ true, () => testInjector.logger);
    const outputFiles = await transpiler.transpile(inputFiles);
    expect(outputFiles).lengthOf(4);
    const mapFiles = outputFiles.filter(file => file.name.endsWith('.map'));
    expect(mapFiles).lengthOf(2);
    expect(mapFiles.map(file => file.name)).deep.eq([
      path.resolve(__dirname, '..', '..', 'testResources', 'sampleProject', 'math.js.map'),
      path.resolve(__dirname, '..', '..', 'testResources', 'sampleProject', 'useMath.js.map')
    ]);
  });

  it('should be able to transpile mutated code', async () => {
    // Transpile mutants
    const mutator = testInjector.injector.injectFunction(typescriptMutatorFactory);
    const mutants = mutator.mutate(inputFiles);
    const transpiler = new TypescriptTranspiler(config, /*produceSourceMaps: */ false, () => testInjector.logger);
    transpiler.transpile(inputFiles);
    const mathDotTS = inputFiles.filter(file => file.name.endsWith('math.ts'))[0];
    const [firstArithmeticOperatorMutant, stringSubtractMutant] = mutants.filter(m => m.mutatorName === 'ArithmeticOperator');
    const correctResult = await transpiler.transpile([mutateFile(mathDotTS, firstArithmeticOperatorMutant)]);
    await expect(transpiler.transpile([mutateFile(mathDotTS, stringSubtractMutant)])).rejectedWith(
      "error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type."
    );
    expect(correctResult).lengthOf(1);
    expect(path.resolve(correctResult[0].name)).eq(path.resolve(path.dirname(mathDotTS.name), 'math.js'));
  });

  function mutateFile(file: File, mutant: Mutant): File {
    return new File(file.name, `${file.content.slice(0, mutant.range[0])}${mutant.replacement}${file.content.slice(mutant.range[1])}`);
  }
});
