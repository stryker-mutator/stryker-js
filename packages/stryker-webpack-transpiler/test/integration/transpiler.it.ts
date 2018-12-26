import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import { Config } from 'stryker-api/config';
import { File } from 'stryker-api/core';
import { TranspilerOptions } from 'stryker-api/transpile';
import WebpackTranspiler from '../../src/WebpackTranspiler';

describe('Webpack transpiler', () => {

  let transpilerConfig: TranspilerOptions;

  beforeEach(() => {
    transpilerConfig = { produceSourceMaps: false, config: new Config() };
    transpilerConfig.config.set({ webpack: {} });
  });

  function readFiles(): File[] {
    const dir = path.resolve(__dirname, '..', '..', 'testResources', 'gettingStarted', 'src');
    const files = fs.readdirSync(dir);

    return files.map(fileName => new File(path.resolve(dir, fileName), fs.readFileSync(path.resolve(dir, fileName))));
  }

  it('should be able to transpile the "gettingStarted" sample', async () => {
    transpilerConfig.config.set({ webpack: { configFile: path.join(getProjectRoot('gettingStarted'), 'webpack.config.js') } });
    const sut = new WebpackTranspiler(transpilerConfig);
    const files = readFiles();

    const transpiledFiles = await sut.transpile(files);
    expect(transpiledFiles).lengthOf(3); // input + output
  });

  it('should be able to transpile "zeroConfig" sample without a Webpack config file', async () => {
    transpilerConfig.config.set({ webpack: { context: getProjectRoot('zeroConfig') } });
    const sut = new WebpackTranspiler(transpilerConfig);
    const files = readFiles();

    const transpiledFiles = await sut.transpile(files);
    expect(transpiledFiles).lengthOf(3); // input + output
  });
});

function getProjectRoot(testResourceProjectName: string) {
  return path.join(process.cwd(), 'testResources', testResourceProjectName);
}
