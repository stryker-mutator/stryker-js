import * as path from 'path';
import { File } from 'stryker-api/core';
import { Config } from 'stryker-api/config';
import { ProjectLoader } from '../helpers/projectLoader';
import BabelTranspiler from '../../src/BabelTranspiler';
import { expect } from 'chai';


function describeIntegrationTest(projectName: string) {

  const projectDir = path.resolve(__dirname, '..', '..', 'testResources', projectName);
  let projectFiles: Array<File> = [];
  let resultFiles: Array<File> = [];
  let babelTranspiler: BabelTranspiler;
  let config: Config;

  beforeEach(async () => {
    projectFiles = await ProjectLoader.getFiles(path.join(projectDir, 'source'));
    resultFiles = await ProjectLoader.getFiles(path.join(projectDir, 'expectedResult'));
    config = new Config();
    config.set({ babelrcFile: path.join(projectDir, '.babelrc') });
    babelTranspiler = new BabelTranspiler({ config, produceSourceMaps: false });
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
    for (let i in expected) {
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
describe('A Babel project with preset', () => {
  describeIntegrationTest('babelPresetProject');
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
