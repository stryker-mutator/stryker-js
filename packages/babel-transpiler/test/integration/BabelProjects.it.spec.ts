import * as path from 'path';
import { File } from '@stryker-mutator/api/core';
import { ProjectLoader } from '../helpers/projectLoader';
import { BabelTranspiler, babelTranspilerFactory } from '../../src/BabelTranspiler';
import { expect } from 'chai';
import { testInjector } from '@stryker-mutator/test-helpers';
import { CONFIG_KEY, StrykerBabelConfig } from '../../src/BabelConfigReader';
import { commonTokens } from '@stryker-mutator/api/plugin';

function describeIntegrationTest(projectName: string, babelConfig: Partial<StrykerBabelConfig> = {}) {

  const projectDir = path.resolve(__dirname, '..', '..', 'testResources', projectName);
  babelConfig.optionsFile = path.join(projectDir, '.babelrc');
  let projectFiles: File[] = [];
  let resultFiles: File[] = [];
  let babelTranspiler: BabelTranspiler;

  beforeEach(async () => {
    projectFiles = await ProjectLoader.getFiles(path.join(projectDir, 'source'));
    resultFiles = await ProjectLoader.getFiles(path.join(projectDir, 'expectedResult'));
    testInjector.options[CONFIG_KEY] = babelConfig;
    babelTranspiler = testInjector.injector
      .provideValue(commonTokens.produceSourceMaps, false)
      .injectFunction(babelTranspilerFactory);
  });

  it('should be able to transpile the input files', async () => {
    const actualResultFiles = await babelTranspiler.transpile(projectFiles);
    const expectedResultFiles = resultFiles.map(file => new File(file.name.replace('expectedResult', 'source'), file.content));
    expectFilesEqual(actualResultFiles, expectedResultFiles);
  });

  it('should have project files', () => {
    expect(projectFiles).not.to.be.empty;
  });

  function expectFilesEqual(actual: ReadonlyArray<File>, expected: ReadonlyArray<File>) {
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
