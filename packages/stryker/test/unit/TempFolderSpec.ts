import { TempFolder } from '../../src/utils/TempFolder';

import * as sinon from 'sinon';
import { expect } from 'chai';
import * as mkdirp from 'mkdirp';
import * as fs from 'mz/fs';

describe.only('TempFolder', () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });
  afterEach(() => sandbox.restore());

  it('TempFolder is presented', () => {
    expect(TempFolder).not.to.be.undefined;

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
      sandbox.stub(mkdirp, 'sync');
      sandbox.stub(process, 'cwd').returns(mockCwd);
      sandbox.stub(TempFolder.instance(), 'random').returns('rand');

      const result = TempFolder.instance().createRandomFolder('prefix');

      // expect(mkdirp.sync).to.have.been.calledThrice;
      expect(mkdirp.sync).to.have.been.calledOnce; // only once since I added test which also calls instance 
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
    beforeEach(() => {
      sandbox.stub(fs, 'writeFile');
    });
    it('should call fs.writeFile', () => {
      TempFolder.instance().writeFile('filename', 'data');
      expect(fs.writeFile).to.have.been.calledWith('filename', 'data', {
        encoding: 'utf8'
      });
    });
  });

  xdescribe('constructor logic', () => {
    beforeEach(() => sandbox.stub(mkdirp, 'sync'));
    it('should create directories on first access to instance', () => {
      TempFolder.instance();
      expect(mkdirp.sync).to.have.been.calledTwice;
    });
    describe('on second access to instance', () => {
      beforeEach(() => {
        TempFolder.instance();
      });
      it('should not create directories', () => {
        TempFolder.instance();
        expect(mkdirp.sync).to.have.been.calledTwice;
      });
    });
  });
});
