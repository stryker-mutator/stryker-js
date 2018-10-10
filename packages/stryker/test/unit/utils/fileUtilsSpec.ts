import * as path from 'path';
import { expect } from 'chai';
import { fsAsPromised } from '@stryker-mutator/util';
import * as fileUtils from '../../../src/utils/fileUtils';

describe('fileUtils', () => {

  let accessStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox.stub(fsAsPromised, 'writeFile');
    sandbox.stub(fsAsPromised, 'symlink');
    accessStub = sandbox.stub(fsAsPromised, 'access');
  });

  describe('writeFile', () => {
    it('should call fs.writeFile', () => {
      fileUtils.writeFile('filename', 'data');
      expect(fsAsPromised.writeFile).calledWith('filename', 'data', 'utf8');
    });
  });

  describe('symlinkJunction', () => {
    it('should call fs.symlink', async () => {
      await fileUtils.symlinkJunction('a', 'b');
      expect(fsAsPromised.symlink).calledWith('a', 'b', 'junction');
    });
  });

  describe('findNodeModules', () => {
    it('should return node_modules located in `basePath`', async () => {
      accessStub.resolves();
      const basePath = path.resolve('a', 'b', 'c');
      const expectedNodeModules = path.join(basePath, 'node_modules');
      const actual = await fileUtils.findNodeModules(basePath);
      expect(actual).eq(expectedNodeModules);
    });

    it('should return node_modules located in parent directory of `basePath` if it didn\'t exist in base path', async () => {
      const basePath = path.resolve('a', 'b', 'c');
      const expectedNodeModules = path.resolve('a', 'node_modules');
      accessStub.rejects('does not exist') // default
        .withArgs(expectedNodeModules).resolves();
      const actual = await fileUtils.findNodeModules(basePath);
      expect(actual).eq(expectedNodeModules);
    });

    it('should return null if no node_modules exist in basePath or parent directories', async () => {
      const basePath = path.resolve('a', 'b', 'c');
      accessStub.rejects('does not exist');
      const actual = await fileUtils.findNodeModules(basePath);
      expect(actual).null;
    });
  });
});
