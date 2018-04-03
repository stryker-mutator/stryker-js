import * as path from 'path';
import * as fs from 'fs';
import WebpackTranspiler from '../../src/WebpackTranspiler';
import { Config } from 'stryker-api/config';
import { expect } from 'chai';
import { File } from 'stryker-api/core';
import { TranspilerOptions } from 'stryker-api/transpile';

describe('Webpack transpiler', function () {
  this.timeout(10000);

  let transpilerConfig: TranspilerOptions;
  
  beforeEach(() => {
    transpilerConfig = { produceSourceMaps: false, config: new Config };
    transpilerConfig.config.set({ webpack: {}});
  });

  function readFiles(): File[] {
    const dir = path.resolve(__dirname, '..', '..', 'testResources', 'gettingStarted', 'src');
    const files = fs.readdirSync(dir);
    return files.map(fileName => new File(path.resolve(dir, fileName), fs.readFileSync(path.resolve(dir, fileName))));
  }

  it('should be able to transpile the "gettingStarted" sample', async () => {
    transpilerConfig.config.set({ webpack: { configFile: path.join(getProjectRoot('gettingStarted'), 'webpack.config.js') }});
    const sut = new WebpackTranspiler(transpilerConfig);
    const files = readFiles();

    const transpiledFiles = await sut.transpile(files);
    expect(transpiledFiles).lengthOf(1);
  });

  it('should be able to transpile "zeroConfig" sample without a Webpack config file', async () => {
    transpilerConfig.config.set({ webpack: { context: getProjectRoot('zeroConfig') }});
    const sut = new WebpackTranspiler(transpilerConfig);
    const files = readFiles();

    const transpiledFiles = await sut.transpile(files);
    expect(transpiledFiles).lengthOf(1);
  });
});

function getProjectRoot(testResourceProjectName: string) {
  return path.join(process.cwd(), 'testResources', testResourceProjectName);
}
