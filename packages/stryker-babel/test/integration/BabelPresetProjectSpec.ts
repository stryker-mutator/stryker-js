import * as path from 'path';
import Config from 'stryker-api/src/config/Config';
import { TextFile } from 'stryker-api/core';
import BabelTranspiler from '../../src/BabelTranspiler';
import { ProjectLoader } from '../helpers/projectLoader';
import { expect } from 'chai';

describe('BabelPresetProject', () => {
  let projectDir = path.resolve(__dirname, '..', '..', 'testResources', 'babelPresetProject');
  let projectFiles: Array<TextFile> = [];
  let expectedResultFiles: Array<TextFile> = [];
  let babelConfig: babel.GeneratorOptions;
  let babelTranspiler: BabelTranspiler;
  let config: Config;

  beforeEach(() => {
    config = new Config();
    projectFiles = ProjectLoader.getFiles(path.join(projectDir, 'source'));
    expectedResultFiles = ProjectLoader.getFiles(path.join(projectDir, 'expectedResult'));
    babelConfig = ProjectLoader.loadBabelRc(projectDir);
    config.set({ babelConfig });
    babelTranspiler = new BabelTranspiler({ config, keepSourceMaps: false });
  });

  it('should have project files', () => {
    expect(projectFiles).not.to.be.empty;
  });

  it('should have a babelrc file', () => {
    expect(babelConfig).to.deep.equal({ presets: ['es2015'] });
  });

  it('should have config.babelConfig set to the babelrc content', () => {
    expect(config.babelConfig).to.deep.equal(babelConfig);
  });

  it('should transform the input files', async () => {
    const result = await babelTranspiler.transpile(projectFiles);

    expectedResultFiles.forEach((expectedResultFile) => {
      expectedResultFile.name = expectedResultFile.name.replace('expectedResult', 'source');
    });

    expect(result.outputFiles).to.deep.equal(expectedResultFiles);
  });
});