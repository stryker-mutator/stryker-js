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
  });

  describe('createRandomFolder', () => {
    it('should create dir with correct path', () => {
      const mockCwd = process.cwd() + '/some/dir';
      sandbox.stub(mkdirp, 'sync');
      sandbox.stub(process, 'cwd').returns(mockCwd);
      sandbox.stub(TempFolder.instance(), 'random').returns('rand');

      const result = TempFolder.instance().createRandomFolder('prefix');
    
      expect(mkdirp.sync).to.have.been.calledThrice;
      expect(result.includes('prefix')).to.be.true;
      expect(result.includes('rand')).to.be.true;
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
