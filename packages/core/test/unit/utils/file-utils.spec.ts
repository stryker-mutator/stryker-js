import * as path from 'path';
import * as fs from 'fs';

import { expect } from 'chai';
import * as sinon from 'sinon';

import * as fileUtils from '../../../src/utils/file-utils';

describe('fileUtils', () => {
  let statStub: sinon.SinonStub;

  beforeEach(() => {
    sinon.stub(fs.promises, 'writeFile');
    sinon.stub(fs.promises, 'symlink');
    statStub = sinon.stub(fs.promises, 'stat');
  });

  describe('symlinkJunction', () => {
    it('should call fs.symlink', async () => {
      await fileUtils.symlinkJunction('a', 'b');
      expect(fs.promises.symlink).calledWith('a', 'b', 'junction');
    });
  });

  describe('findNodeModules', () => {
    it('should return node_modules located in `basePath`', async () => {
      statStub.resolves();
      const basePath = path.resolve('a', 'b', 'c');
      const expectedNodeModules = path.join(basePath, 'node_modules');
      const actual = await fileUtils.findNodeModules(basePath);
      expect(actual).eq(expectedNodeModules);
    });

    it("should return node_modules located in parent directory of `basePath` if it didn't exist in base path", async () => {
      const basePath = path.resolve('a', 'b', 'c');
      const expectedNodeModules = path.resolve('a', 'node_modules');
      statStub
        .throws() // default
        .withArgs(expectedNodeModules)
        .resolves();
      const actual = await fileUtils.findNodeModules(basePath);
      expect(actual).eq(expectedNodeModules);
    });

    it('should return null if no node_modules exist in basePath or parent directories', async () => {
      const basePath = path.resolve('a', 'b', 'c');
      statStub.throws();
      const actual = await fileUtils.findNodeModules(basePath);
      expect(actual).null;
    });
  });
});
