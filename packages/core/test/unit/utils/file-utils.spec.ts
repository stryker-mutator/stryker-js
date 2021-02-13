import fs from 'fs';
import path from 'path';

import { expect } from 'chai';
import sinon from 'sinon';

import * as fileUtils from '../../../src/utils/file-utils';

function wrapDirs(dirs: string[]) {
  return dirs.map((d) => {
    return {
      name: d,
      isDirectory: () => true,
    };
  });
}

describe('fileUtils', () => {
  let readdirStub: sinon.SinonStub;

  beforeEach(() => {
    sinon.stub(fs.promises, 'writeFile');
    sinon.stub(fs.promises, 'symlink');
    readdirStub = sinon.stub(fs.promises, 'readdir');
  });

  describe('symlinkJunction', () => {
    it('should call fs.symlink', async () => {
      await fileUtils.symlinkJunction('a', 'b');
      expect(fs.promises.symlink).calledWith('a', 'b', 'junction');
    });
  });

  describe('findNodeModulesList', () => {
    it('should return node_modules array located in `basePath`', async () => {
      const basePath = path.resolve('a', 'b', 'c');
      const expectedNodeModules = path.join('node_modules');
      readdirStub.resolves(wrapDirs(['node_modules']));
      const actual = await fileUtils.findNodeModulesList(basePath);
      expect(actual[0]).eq(expectedNodeModules);
    });

    it('should return node_modules array in subDirectory of `basePath`', async () => {
      const basePath = path.resolve('.');
      const expectedNodeModulesList = [path.join('a', 'b', 'node_modules'), path.join('a', 'b', 'c', 'node_modules')];
      readdirStub.withArgs(path.resolve(basePath)).resolves(wrapDirs(['a']));
      readdirStub.withArgs(path.resolve(basePath, 'a')).resolves(wrapDirs(['b']));
      readdirStub.withArgs(path.resolve(basePath, 'a', 'b')).resolves(wrapDirs(['c', 'node_modules']));
      readdirStub.withArgs(path.resolve(basePath, 'a', 'b', 'c')).resolves(wrapDirs(['node_modules']));
      const actual = await fileUtils.findNodeModulesList(basePath);
      expect(actual).deep.eq(expectedNodeModulesList);
    });

    it('should return empty array if no node_modules exist in basePath or parent directories', async () => {
      const basePath = path.resolve('a', 'b', 'c');
      readdirStub.resolves([]);
      const actual = await fileUtils.findNodeModulesList(basePath);
      expect(actual.length).eq(0);
    });
  });
});
