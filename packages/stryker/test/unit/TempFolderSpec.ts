import { TempFolder } from '../../src/utils/TempFolder';

import * as sinon from 'sinon';
import { expect } from 'chai';
import * as mkdirp from 'mkdirp';
import * as fs from 'mz/fs';
import * as fileUtils from '../../src/utils/fileUtils';
import * as path from 'path';

describe.only('TempFolder', () => {
  let sandbox: sinon.SinonSandbox;
  let cwdStub: sinon.SinonStub;
  let randomStub: sinon.SinonStub;
  let deleteDirStub: sinon.SinonStub;
  const defaultTempDirName = '.stryker-tmp';
  const mockCwd = '/x/y/z/some/dir';

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    sandbox.stub(mkdirp, 'sync');
    sandbox.stub(fs, 'writeFile');
    deleteDirStub = sandbox.stub(fileUtils, 'deleteDir');
    cwdStub = sandbox.stub(process, 'cwd');
    cwdStub.returns(mockCwd);
    randomStub = sandbox.stub(TempFolder.instance(), 'random');
    randomStub.returns('rand');
   
    TempFolder.instance().initialize();
  });
  afterEach(() => sandbox.restore());

  it('should have correct internal state after initialize call', () => {
    expect(TempFolder.instance().baseTempFolder).to.equal(`${path.join(mockCwd, defaultTempDirName)}`);
    expect(TempFolder.instance().tempFolder).to.equal(`${path.join(mockCwd, defaultTempDirName, 'rand')}`);
  });

  it('TempFolder is presented', () => {
    const tempFolderInstance = TempFolder.instance();

    expect(tempFolderInstance.createRandomFolder).to.exist;
    expect(tempFolderInstance.writeFile).to.exist;
    expect(tempFolderInstance.copyFile).to.exist;
    expect(tempFolderInstance.clean).to.exist;
    expect(tempFolderInstance.random).to.exist;
  });

  describe('createRandomFolder', () => {
    it('should create dir with correct path', () => {
      const result = TempFolder.instance().createRandomFolder('prefix');

      expect(mkdirp.sync).to.have.been.calledThrice;
      expect(result.includes('prefix')).to.be.true;
      expect(result.includes('rand')).to.be.true;
    });
  });

  describe('clean', () => {
    it('should call deleteDir fileApi', () => {
      deleteDirStub.resolves('delResolveStub');

      const tempFolderInstance = TempFolder.instance();
      const result = tempFolderInstance.clean();

      expect(fileUtils.deleteDir).to.have.been.calledWith(tempFolderInstance.baseTempFolder);
      
      result.then(data => expect(data).equals('delResolveStub'));
    });
  });

  describe('copyFile', () => {
    it('should call fs api', () => {
      // TODO
    });
  });

  describe('writeFile', () => {
    it('should call fs.writeFile', () => {
      TempFolder.instance().writeFile('filename', 'data');
      expect(fs.writeFile).to.have.been.calledWith('filename', 'data', {
        encoding: 'utf8'
      });
    });
  });
});
