import { Mutant } from 'stryker-api/mutant';
import * as path from 'path';
import * as fs from 'fs';
import { expect } from 'chai';
import { Config } from 'stryker-api/config';
import { TextFile, FileKind } from 'stryker-api/core';
import TypescriptConfigEditor from '../../src/TypescriptConfigEditor';
import TypescriptMutantGenerator from '../../src/TypescriptMutantGenerator';
import TypescriptTranspiler from '../../src/TypescriptTranspiler';
import { setGlobalLogLevel } from 'log4js';

describe('Sample integration', function () {
  this.timeout(10000);

  let config: Config;
  let inputFiles: TextFile[];

  beforeEach(() => {
    setGlobalLogLevel('error');
    const configEditor = new TypescriptConfigEditor();
    config = new Config();
    config.set({
      tsconfigFile: path.resolve(__dirname, '..', '..', 'testResources', 'sampleProject', 'tsconfig.json'),
    });
    configEditor.edit(config);
    inputFiles = config.files.map((file): TextFile => ({
      name: file as string,
      content: fs.readFileSync(file as string, 'utf8'),
      included: true,
      mutated: true, 
      transpiled: true,
      kind: FileKind.Text
    }));
  });

  afterEach(() => {
    setGlobalLogLevel('trace');
  });

  it('should be able to generate mutants', () => {
    // Generate mutants
    const mutantGenerator = new TypescriptMutantGenerator(config);
    const mutants = mutantGenerator.generateMutants(inputFiles);
    expect(mutants.length).to.eq(2);
  });

  it('should be able to transpile source code', () => {
    const transpiler = new TypescriptTranspiler({ config, keepSourceMaps: true });
    const transpileResult = transpiler.transpile(inputFiles);
    expect(transpileResult.error).to.be.null;
    const outputFiles = transpileResult.outputFiles;
    expect(outputFiles.length).to.eq(2);
  });

  it('should be able to mutate transpiled code', () => {
    // Transpile mutants
    const mutantGenerator = new TypescriptMutantGenerator(config);
    const mutants = mutantGenerator.generateMutants(inputFiles);
    const transpiler = new TypescriptTranspiler({ config, keepSourceMaps: true });
    transpiler.transpile(inputFiles);
    const mathDotTS = inputFiles.filter(file => file.name.endsWith('math.ts'))[0];
    const [firstBinaryMutant, stringSubtractMutant] = mutants.filter(m => m.mutatorName === 'BinaryExpression');
    const correctResult = transpiler.transpile([mutateFile(mathDotTS, firstBinaryMutant)]);
    const errorResult = transpiler.transpile([mutateFile(mathDotTS, stringSubtractMutant)]);
    expect(correctResult.error).null;
    expect(correctResult.outputFiles).lengthOf(1);
    expect(path.resolve(correctResult.outputFiles[0].name)).eq(path.resolve(path.dirname(mathDotTS.name), 'math.js'));
    expect(errorResult.error).matches(/error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number' or an enum type/);
    expect(errorResult.outputFiles).lengthOf(0);
  });

  function mutateFile(file: TextFile, mutant: Mutant): TextFile {
    return {
      name: file.name,
      content: file.content.slice(0, mutant.range[0]) + mutant.replacement + file.content.slice(mutant.range[1]),
      mutated: true,
      included: true, 
      transpiled: true,
      kind: FileKind.Text
    };
  }
});