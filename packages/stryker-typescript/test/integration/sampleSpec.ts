import * as path from 'path';
import { expect } from 'chai';
import { Config } from 'stryker-api/config';
import TypescriptConfigEditor from '../../src/TypescriptConfigEditor';
import TypescriptMutantGenerator from '../../src/TypescriptMutantGenerator';

describe('Sample integration', function () {
  this.timeout(10000);
  it('should work for the math sample', () => {
    const configEditor = new TypescriptConfigEditor();
    const config = new Config();
    config.set({
      tsconfigFile: path.resolve(__dirname, '..', '..', 'testResources', 'sampleProject', 'tsconfig.json')
    });
    configEditor.edit(config);
    const mutantGenerator = new TypescriptMutantGenerator(config);
    const mutants = mutantGenerator.generateMutants(config.files.map(file => ({ path: file as string, mutated: true, included: true })));
    expect(mutants).lengthOf.above(4);
  });
});