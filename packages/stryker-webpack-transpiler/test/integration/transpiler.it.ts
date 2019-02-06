import * as path from 'path';
import * as fs from 'fs';
import WebpackTranspiler from '../../src/WebpackTranspiler';
import { expect } from 'chai';
import { File } from 'stryker-api/core';
import { testInjector } from '@stryker-mutator/test-helpers';
import { commonTokens } from 'stryker-api/plugin';
import ConfigLoader from '../../src/compiler/ConfigLoader';
import { pluginTokens } from '../../src/pluginTokens';

describe('Webpack transpiler', () => {

  beforeEach(() => {
    testInjector.options.webpack = {};
  });

  it('should be able to transpile the "gettingStarted" sample', async () => {
    testInjector.options.webpack.configFile = path.join(getProjectRoot('gettingStarted'), 'webpack.config.js');
    const sut = createSut();
    const files = readFiles();

    const transpiledFiles = await sut.transpile(files);
    expect(transpiledFiles).lengthOf(3); // input + output
  });

  it('should be able to transpile "zeroConfig" sample without a Webpack config file', async () => {
    testInjector.options.webpack.context = getProjectRoot('zeroConfig');
    const sut = createSut();
    const files = readFiles();

    const transpiledFiles = await sut.transpile(files);
    expect(transpiledFiles).lengthOf(3); // input + output
  });
});

function createSut() {
  return testInjector.injector
    .provideValue(commonTokens.produceSourceMaps, false)
    .provideValue(pluginTokens.require, require)
    .provideClass(pluginTokens.configLoader, ConfigLoader)
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
