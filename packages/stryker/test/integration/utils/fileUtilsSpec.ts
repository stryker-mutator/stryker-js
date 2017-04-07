import * as fs from 'graceful-fs';
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as fileUtils from '../../../src/utils/fileUtils';

describe('fileUtils', () => {

  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => sandbox.restore());

  describe('readFileSync()', () => {
    it('should synchronously', () => {
      const msg = 'hello 1 2';
      sandbox.stub(fs, 'readFileSync', (filename: string, encoding: string) => msg);
      const data = fileUtils.readFile('hello.js');
      expect(data).to.equal(msg);
    });
  });

  describe('fileOrFolderExistsSync()', () => {
    it('should indicate that an existing file exists', () => {
      const exists = fileUtils.fileOrFolderExistsSync('src/Stryker.ts');

      expect(exists).to.equal(true);
    });
    it('should indicate that an non-existing file does not exists', () => {
      const exists = fileUtils.fileOrFolderExistsSync('src/Strykerfaefeafe.js');

      expect(exists).to.equal(false);
    });
  });

  describe('glob', () => {
    it('should resolve files', () => 
      expect(fileUtils.glob('testResources/globTestFiles/sample/**/*.js')).to.eventually.have.length(10));

    it('should not resolve to directories', () => 
      expect(fileUtils.glob('testResources/globTestFiles/notResolveDirs/**/*.js')).to.eventually.have.length(1));
  });

});
