import path from 'path';
import fs from 'fs';

import { expect } from 'chai';
import sinon from 'sinon';

import * as fileUtils from '../../../src/utils/file-utils';

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
      readdirStub.resolves(['node_modules']);
      const actual = await fileUtils.findNodeModulesList(basePath);
      expect(actual[0]).eq(expectedNodeModules);
    });

    it("should return node_modules array located in parent directory of `basePath` if it didn't exist in base path", async () => {
      const basePath = path.resolve('a', 'b', 'c');
      const expectedNodeModules = 'node_modules';
      readdirStub.withArgs(path.resolve('a')).resolves(['node_modules']);
      const actual = await fileUtils.findNodeModulesList(basePath);
      expect(actual[0]).eq(expectedNodeModules);
    });

    it('should return node_modules array in subDirectory of `basePath`', async () => {
      const basePath = path.resolve('.');
      const expectedNodeModulesList = [path.join('a', 'b', 'node_modules'), path.join('a', 'b', 'c', 'node_modules')];
      readdirStub.withArgs(path.resolve(basePath)).resolves(['a']);
      readdirStub.withArgs(path.resolve(basePath, 'a')).resolves(['b']);
      readdirStub.withArgs(path.resolve(basePath, 'a', 'b')).resolves(['c', 'node_modules']);
      readdirStub.withArgs(path.resolve(basePath, 'a', 'b', 'c')).resolves(['node_modules']);
      const actual = await fileUtils.findNodeModulesList(basePath);
      expect(actual).deep.eq(expectedNodeModulesList);
    });

    it("should return node_modules array in parent directories's subDirectory of `basePath` if it did't exist in `basePath`", async () => {
      const basePath = path.resolve('a', 'b', 'c');
      const expectedNodeModulesList = ['node_modules'];
      readdirStub.withArgs(path.resolve('a')).resolves([]);
      readdirStub.withArgs(path.resolve('a', 'b')).resolves(['c', 'node_modules']);
      const actual = await fileUtils.findNodeModulesList(basePath);
      expect(actual).deep.eq(expectedNodeModulesList);
    });

    it('should return empty array if no node_modules exist in basePath or parent directories', async () => {
      const basePath = path.resolve('a', 'b', 'c');
      const actual = await fileUtils.findNodeModulesList(basePath);
      expect(actual.length).eq(0);
    });
  });
});
