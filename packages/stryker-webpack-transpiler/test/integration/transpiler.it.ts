import * as path from 'path';
import * as fs from 'fs';
import WebpackTranspiler, { StrykerWebpackConfig } from '../../src/WebpackTranspiler';
import { Config } from 'stryker-api/config';
import { TextFile, FileKind } from 'stryker-api/core';
import { expect } from 'chai';

describe('Webpack transpiler', () => {

  function createSut() {
    const config = new Config();
    const strykerWebpackConfig: StrykerWebpackConfig = {
      project: 'default',
      configLocation: path.resolve(__dirname, '..', '..', 'testResources', 'gettingStarted', 'webpack.config.js')
    };
    config.set({
      webpack: strykerWebpackConfig
    });
    return new WebpackTranspiler({ keepSourceMaps: false, config });
  }

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
    const sut = createSut();
    const files = readFiles();
    const transpiledFiles = await sut.transpile(files);
    expect(transpiledFiles.error).null;
    expect(transpiledFiles.outputFiles).lengthOf(1);
  });

});

