import * as path from 'path';
import * as fs from 'fs';
import WebpackTranspiler from '../../src/WebpackTranspiler';
import { expect } from 'chai';
import { File } from '@stryker-mutator/api/core';
import { TEST_INJECTOR } from '@stryker-mutator/test-helpers';
import { COMMON_TOKENS } from '@stryker-mutator/api/plugin';
import ConfigLoader from '../../src/compiler/ConfigLoader';
import { PLUGIN_TOKENS } from '../../src/pluginTokens';

describe('Webpack transpiler', () => {

  beforeEach(() => {
    TEST_INJECTOR.options.webpack = {};
  });

  it('should be able to transpile the "gettingStarted" sample', async () => {
    TEST_INJECTOR.options.webpack.configFile = path.join(getProjectRoot('gettingStarted'), 'webpack.config.js');
    const sut = createSut();
    const files = readFiles();

    const transpiledFiles = await sut.transpile(files);
    const bundleFile = transpiledFiles.filter(file => file.name.indexOf('my-first-webpack.bundle.js') >= 0)[0];
    expect(transpiledFiles).lengthOf(3); // input + output
    expect(bundleFile.textContent).include('Hello world!'); // input + output
  });

  it('should be able to transpile "zeroConfig" sample without a Webpack config file', async () => {
    TEST_INJECTOR.options.webpack.context = getProjectRoot('zeroConfig');
    const sut = createSut();
    const files = readFiles();

    const transpiledFiles = await sut.transpile(files);
    expect(transpiledFiles).lengthOf(3); // input + output
  });
});

function createSut() {
  return TEST_INJECTOR.injector
    .provideValue(COMMON_TOKENS.produceSourceMaps, false)
    .provideValue(PLUGIN_TOKENS.require, require)
    .provideClass(PLUGIN_TOKENS.configLoader, ConfigLoader)
    .injectClass(WebpackTranspiler);
}

function getProjectRoot(testResourceProjectName: string) {
  return path.join(process.cwd(), 'testResources', testResourceProjectName);
}

function readFiles(): File[] {
  const dir = path.resolve(__dirname, '..', '..', 'testResources', 'gettingStarted', 'src');
  const files = fs.readdirSync(dir);
  return files.map(fileName => new File(path.resolve(dir, fileName), fs.readFileSync(path.resolve(dir, fileName))));
}
