import * as path from 'path';
import * as fs from 'fs';

import { expect } from 'chai';
import * as sinon from 'sinon';

import * as fileUtils from '../../../src/utils/fileUtils';

describe('fileUtils', () => {
  let existsStub: sinon.SinonStub;

  beforeEach(() => {
    sinon.stub(fs.promises, 'writeFile');
    sinon.stub(fs.promises, 'symlink');
    existsStub = sinon.stub(fs.promises, 'stat');
  });

  describe('writeFile', () => {
    it('should call fs.writeFile', () => {
      fileUtils.writeFile('filename', 'data');
      expect(fs.promises.writeFile).calledWith('filename', 'data', 'utf8');
    });
  });

  describe('symlinkJunction', () => {
    it('should call fs.symlink', async () => {
      await fileUtils.symlinkJunction('a', 'b');
      expect(fs.promises.symlink).calledWith('a', 'b', 'junction');
    });
  });

  describe('findNodeModules', () => {
    it('should return node_modules located in `basePath`', async () => {
      existsStub.resolves(true);
      const basePath = path.resolve('a', 'b', 'c');
      const expectedNodeModules = path.join(basePath, 'node_modules');
      const actual = await fileUtils.findNodeModules(basePath);
      expect(actual).eq(expectedNodeModules);
    });

    it("should return node_modules located in parent directory of `basePath` if it didn't exist in base path", async () => {
      const basePath = path.resolve('a', 'b', 'c');
      const expectedNodeModules = path.resolve('a', 'node_modules');
      existsStub
        .resolves(false) // default
        .withArgs(expectedNodeModules)
        .resolves(true);
      const actual = await fileUtils.findNodeModules(basePath);
      expect(actual).eq(expectedNodeModules);
    });

    it('should return null if no node_modules exist in basePath or parent directories', async () => {
      const basePath = path.resolve('a', 'b', 'c');
      existsStub.resolves(false);
      const actual = await fileUtils.findNodeModules(basePath);
      expect(actual).null;
    });
  });
});
