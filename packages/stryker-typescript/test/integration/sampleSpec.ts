import * as path from 'path';
import * as fs from 'fs';
import { expect } from 'chai';
import { Config } from 'stryker-api/config';
import { Transpiler, FileStream, FileLocation } from 'stryker-api/transpile';
import { streamToString } from '../../src/helpers/streamUtils';
import TypescriptConfigEditor from '../../src/TypescriptConfigEditor';
import TypescriptMutantGenerator from '../../src/TypescriptMutantGenerator';
import TypescriptTranspiler from '../../src/TypescriptTranspiler';
const streamify = require('streamify-string');

class CatchTranspiler implements Transpiler {
  files: FileStream[];
  transpile(files: FileStream[]): Promise<string | null> {
    this.files = files;
    return Promise.resolve(null);
  }
  mutate(file: FileStream): Promise<string | null> {
    this.files.push(file);
    return Promise.resolve(null);
  }
  getMappedLocation(sourceFileLocation: FileLocation): FileLocation {
    return sourceFileLocation;
  }
}

describe('Sample integration', function () {
  this.timeout(10000);
  it('should work for the math sample', async () => {
    // Read config
    const configEditor = new TypescriptConfigEditor();
    const config = new Config();
    config.set({
      tsconfigFile: path.resolve(__dirname, '..', '..', 'testResources', 'sampleProject', 'tsconfig.json')
    });
    configEditor.edit(config);

    // Generate mutants
    const mutantGenerator = new TypescriptMutantGenerator(config);
    const mutants = mutantGenerator.generateMutants(config.files.map(file => ({ path: file as string, mutated: true, included: true })));
    expect(mutants.length).to.eq(5);

    // Create transpiler chain
    const lastTranspiler = new CatchTranspiler();
    const transpiler = new TypescriptTranspiler({ config, nextTranspiler: lastTranspiler, keepSourceMaps: true });

    // Transpile files
    const error = await transpiler.transpile(config.files.map(file => ({ name: file as string, content: fs.createReadStream(file as string) })));
    expect(error).to.be.null;
    const outputFiles = await Promise.all(lastTranspiler.files.map(file => streamToString(file.content).then(content => ({ name: file.name, content }))));
    expect(outputFiles.length).to.eq(2);

    // Transpile mutants
    const originalSourceFiles = config.files.map(file => ({ name: file, content: fs.readFileSync(file as string, 'utf8') }));
    const mutatedFiles = mutants.map(mutant => {
      const file = originalSourceFiles.find(f => f.name === mutant.fileName);
      if (file) {
        return {
          name: file.name as string,
          content: streamify(file.content.slice(0, mutant.range[0]) + mutant.replacementSourceCode + file.content.slice(mutant.range[1]))
        };
      } else {
        throw new Error('error');
      }
    });
    await Promise.all(mutatedFiles.map(mutatedFile => transpiler.mutate(mutatedFile)));
    expect(lastTranspiler.files.length).to.eq(7);
    
  });
});