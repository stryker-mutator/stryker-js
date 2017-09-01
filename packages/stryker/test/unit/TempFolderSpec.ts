import { TempFolder } from '../../src/utils/TempFolder';

import * as sinon from 'sinon';
import { expect } from 'chai';
import * as mkdirp from 'mkdirp';
import * as fs from 'mz/fs';

describe.only('TempFolder', () => {
  let sandbox: sinon.SinonSandbox;
  let cwdStub: sinon.SinonStub;
  let randomStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    TempFolder.instance().initialize();

    sandbox.stub(mkdirp, 'sync');
    sandbox.stub(fs, 'writeFile');
    cwdStub = sandbox.stub(process, 'cwd');
    randomStub = sandbox.stub(TempFolder.instance(), 'random');
  });
  afterEach(() => sandbox.restore());

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
      const mockCwd = process.cwd() + '/some/dir';
      
      cwdStub.returns(mockCwd);
      randomStub.returns('rand');

      const result = TempFolder.instance().createRandomFolder('prefix');

      expect(mkdirp.sync).to.have.been.calledOnce;
      expect(result.includes('prefix')).to.be.true;
      expect(result.includes('rand')).to.be.true;
    });
  });

  describe('clean', () => {
    it('should call deleteDir fileApi', () => {
      // TODO
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
