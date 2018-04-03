import { Mutant } from 'stryker-api/mutant';
import * as path from 'path';
import * as fs from 'fs';
import { expect } from 'chai';
import { Config } from 'stryker-api/config';
import { File } from 'stryker-api/core';
import TypescriptConfigEditor from '../../src/TypescriptConfigEditor';
import TypescriptMutator from '../../src/TypescriptMutator';
import TypescriptTranspiler from '../../src/TypescriptTranspiler';
import { setGlobalLogLevel } from 'log4js';
import { CONFIG_KEY } from '../../src/helpers/keys';

describe('Sample integration', function () {
  this.timeout(10000);

  let config: Config;
  let inputFiles: File[];

  beforeEach(() => {
    setGlobalLogLevel('error');
    const configEditor = new TypescriptConfigEditor();
    config = new Config();
    config.set({
      tsconfigFile: path.resolve(__dirname, '..', '..', 'testResources', 'sampleProject', 'tsconfig.json'),
    });
    configEditor.edit(config);
    inputFiles = config[CONFIG_KEY].fileNames.map((fileName: string) => new File(fileName, fs.readFileSync(fileName, 'utf8')));
  });

  afterEach(() => {
    setGlobalLogLevel('trace');
  });

  it('should be able to generate mutants', () => {
    // Generate mutants
    const mutator = new TypescriptMutator(config);
    const mutants = mutator.mutate(inputFiles);
    expect(mutants.length).to.eq(5);
  });

  it('should be able to transpile source code', async () => {
    const transpiler = new TypescriptTranspiler({ config, produceSourceMaps: false });
    const outputFiles = await transpiler.transpile(inputFiles);
    expect(outputFiles.length).to.eq(2);
  });

  it('should be able to produce source maps', async () => {
    const transpiler = new TypescriptTranspiler({ config, produceSourceMaps: true });
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
    const mutator = new TypescriptMutator(config);
    const mutants = mutator.mutate(inputFiles);
    const transpiler = new TypescriptTranspiler({ config, produceSourceMaps: false });
    transpiler.transpile(inputFiles);
    const mathDotTS = inputFiles.filter(file => file.name.endsWith('math.ts'))[0];
    const [firstBinaryMutant, stringSubtractMutant] = mutants.filter(m => m.mutatorName === 'BinaryExpression');
    const correctResult = await transpiler.transpile([mutateFile(mathDotTS, firstBinaryMutant)]);
    await expect(transpiler.transpile([mutateFile(mathDotTS, stringSubtractMutant)]))
      .rejectedWith('error TS2362: The left-hand side of an arithmetic operation must be of type \'any\', \'number\' or an enum type');
    expect(correctResult).lengthOf(1);
    expect(path.resolve(correctResult[0].name)).eq(path.resolve(path.dirname(mathDotTS.name), 'math.js'));
  });

  function mutateFile(file: File, mutant: Mutant): File {
    return new File(file.name,
      file.content.slice(0, mutant.range[0]) + mutant.replacement + file.content.slice(mutant.range[1]));
  }
});