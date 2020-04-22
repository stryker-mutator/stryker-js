import * as path from 'path';

import { File } from '@stryker-mutator/api/core';
import { commonTokens } from '@stryker-mutator/api/plugin';
import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { BabelTranspiler, babelTranspilerFactory } from '../../src/BabelTranspiler';
import { ProjectLoader } from '../helpers/projectLoader';
import { StrykerBabelConfig } from '../../src-generated/babel-transpiler-options';
import { BabelTranspilerWithStrykerOptions } from '../../src/BabelTranspilerWithStrykerOptions';
import { createStrykerBabelConfig } from '../helpers/factories';

function describeIntegrationTest(projectName: string, babelConfig: Partial<StrykerBabelConfig> = {}) {
  const projectDir = path.resolve(__dirname, '..', '..', 'testResources', projectName);
  babelConfig.optionsFile = path.join(projectDir, babelConfig.optionsFile || '.babelrc');
  let projectFiles: File[] = [];
  let resultFiles: File[] = [];
  let babelTranspiler: BabelTranspiler;

  beforeEach(async () => {
    projectFiles = await ProjectLoader.getFiles(path.join(projectDir, 'source'));
    resultFiles = await ProjectLoader.getFiles(path.join(projectDir, 'expectedResult'));
    ((testInjector.options as unknown) as BabelTranspilerWithStrykerOptions).babel = createStrykerBabelConfig(babelConfig);
    babelTranspiler = testInjector.injector.provideValue(commonTokens.produceSourceMaps, false).injectFunction(babelTranspilerFactory);
  });

  it('should be able to transpile the input files', async () => {
    const actualResultFiles = await babelTranspiler.transpile(projectFiles);
    const expectedResultFiles = resultFiles.map((file) => new File(file.name.replace('expectedResult', 'source'), file.content));
    expectFilesEqual(actualResultFiles, expectedResultFiles);
  });

  it('should have project files', () => {
    expect(projectFiles).not.to.be.empty;
  });

  function expectFilesEqual(actual: readonly File[], expected: readonly File[]) {
    expect(actual).lengthOf(expected.length);
    for (const i in expected) {
      expect(actual[i].name).deep.eq(expected[i].name);
      expect(actual[i].textContent, expected[i].name).deep.eq(expected[i].textContent);
      expect(actual[i].content, expected[i].name).deep.eq(expected[i].content);
    }
  }
}

describe('A babel project with the `only` option enabled', () => {
  describeIntegrationTest('babelOnlyOption');
});
describe('A babel project with a plugin', () => {
  describeIntegrationTest('babelPluginProject');
});
describe('A Babel project with typescript preset', () => {
  describeIntegrationTest('babelTypescriptProject', { extensions: ['.ts'] });
});
describe('A Babel project with flow preset', () => {
  describeIntegrationTest('babelFlowProject');
});
describe('A Babel project', () => {
  describeIntegrationTest('babelProject');
});
describe('Project with binary files', () => {
  describeIntegrationTest('babelProjectWithBinaryFiles');
});
describe('Different extensions', () => {
  describeIntegrationTest('differentExtensions');
});
describe('A Babel project with babel.config.js config file that exports function', () => {
  describeIntegrationTest('babelProjectWithBabelConfigJs', {
    extensions: ['.ts'],
    optionsFile: 'babel.config.js',
  });
});
describe('A Babel project with babel.config.js config file that exports object', () => {
  describeIntegrationTest('babelProjectWithBabelConfigJsObject', {
    extensions: ['.ts'],
    optionsFile: 'babel.config.js',
  });
});
describe('A Babel project with .babelrc.js config file', () => {
  describeIntegrationTest('babelProjectWithBabelRcJs', {
    extensions: ['.ts'],
    optionsFile: '.babelrc.js',
  });
});
