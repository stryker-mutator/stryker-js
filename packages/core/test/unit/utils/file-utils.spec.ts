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
      const expectedNodeModules = path.join(basePath, 'node_modules');
      readdirStub.resolves([expectedNodeModules]);
      const actual = await fileUtils.findNodeModulesList(basePath);
      expect(actual.nodeModulesList[0]).eq(expectedNodeModules);
    });

    it("should return node_modules array located in parent directory of `basePath` if it didn't exist in base path", async () => {
      const basePath = path.resolve('a', 'b', 'c');
      const expectedNodeModules = path.resolve('a', 'node_modules');
      readdirStub.withArgs(path.dirname(path.resolve(basePath))).resolves([expectedNodeModules]);
      const actual = await fileUtils.findNodeModulesList(basePath);
      expect(actual.nodeModulesList[0]).eq(expectedNodeModules);
    });

    it('should return node_modules array in subDirectory of `basePath`', async () => {
      const basePath = path.resolve('a');
      const expectedNodeModulesList = [path.resolve('a', 'b', 'node_modules'), path.resolve('a', 'b', 'c', 'node_modules')];
      readdirStub.withArgs(path.resolve(basePath)).resolves([path.resolve(basePath, 'b')]);
      readdirStub.withArgs(path.resolve(basePath, 'b')).resolves([path.resolve(basePath, 'b', 'c'), path.resolve(basePath, 'b', 'node_modules')]);
      readdirStub.withArgs(path.resolve(basePath, 'b', 'c')).resolves([path.resolve(basePath, 'b', 'c', 'node_modules')]);
      const actual = await fileUtils.findNodeModulesList(basePath);
      expect(actual.nodeModulesList).deep.eq(expectedNodeModulesList);
    });

    it("should return node_modules array in parent directories's subDirectory of `basePath` if it did't exist in `basePath`", async () => {
      const basePath = path.resolve('a', 'b', 'c');
      const expectedNodeModulesList = [path.resolve('a', 'b', 'node_modules')];
      readdirStub.withArgs(path.resolve('a')).resolves([]);
      readdirStub.withArgs(path.resolve('a', 'b')).resolves([path.resolve('a', 'b', 'c'), path.resolve('a', 'b', 'node_modules')]);
      const actual = await fileUtils.findNodeModulesList(basePath);
      expect(actual.nodeModulesList).deep.eq(expectedNodeModulesList);
    });

    it('should return empty array if no node_modules exist in basePath or parent directories', async () => {
      const basePath = path.resolve('a', 'b', 'c');
      const actual = await fileUtils.findNodeModulesList(basePath);
      expect(actual.nodeModulesList.length).eq(0);
    });
  });
});
