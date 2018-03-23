import * as path from 'path';
import * as fs from 'fs';
import WebpackTranspiler from '../../src/WebpackTranspiler';
import { Config } from 'stryker-api/config';
import { TextFile, FileKind } from 'stryker-api/core';
import { expect } from 'chai';
import { TranspilerOptions } from 'stryker-api/transpile';

describe('Webpack transpiler', function () {
  this.timeout(10000);

  let transpilerConfig: TranspilerOptions;
  
  beforeEach(() => {
    transpilerConfig = { produceSourceMaps: false, config: new Config };
    transpilerConfig.config.set({ webpack: {}});
  });

  function readFiles(): TextFile[] {
    const dir = path.resolve(__dirname, '..', '..', 'testResources', 'gettingStarted', 'src');
    const files = fs.readdirSync(dir);
    return files.map(fileName => {
      const file: TextFile = {
        name: path.resolve(dir, fileName),
        content: fs.readFileSync(path.resolve(dir, fileName), 'utf8'),
        kind: FileKind.Text,
        transpiled: true,
        mutated: true,
        included: true
      };
      return file;
    });
  }

  it('should be able to transpile the "gettingStarted" sample', async () => {
    transpilerConfig.config.set({ webpack: { configFile: path.join(getProjectRoot('gettingStarted'), 'webpack.config.js') }});
    const sut = new WebpackTranspiler(transpilerConfig);
    const files = readFiles();

    const transpiledFiles = await sut.transpile(files);

    expect(transpiledFiles.error).null;
    expect(transpiledFiles.outputFiles).lengthOf(1);
  });

  it('should be able to transpile "zeroConfig" sample without a Webpack config file', async () => {
    transpilerConfig.config.set({ webpack: { context: getProjectRoot('zeroConfig') }});
    const sut = new WebpackTranspiler(transpilerConfig);
    const files = readFiles();

    const transpiledFiles = await sut.transpile(files);

    expect(transpiledFiles.error).null;
    expect(transpiledFiles.outputFiles).lengthOf(1);
  });
});

function getProjectRoot(testResourceProjectName: string) {
  return path.join(process.cwd(), 'testResources', testResourceProjectName);
}
