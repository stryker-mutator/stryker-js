import * as fs from 'fs';
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as fileUtils from '../../../src/utils/fileUtils';

describe('fileUtils', () => {

  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => sandbox.restore());

  describe('should be able to read a file', () => {

    it('synchronously', () => {
      const msg = 'hello 1 2';
      sandbox.stub(fs, 'readFileSync', (filename: string, encoding: string) => msg);
      const data = fileUtils.readFile('hello.js');
      expect(data).to.equal(msg);
    });
  });

  it('should indicate that an existing file exists', () => {
    const exists = fileUtils.fileOrFolderExistsSync('src/Stryker.ts');

    expect(exists).to.equal(true);
  });

  it('should indicate that an non-existing file does not exists', () => {
    const exists = fileUtils.fileOrFolderExistsSync('src/Strykerfaefeafe.js');

    expect(exists).to.equal(false);
  });

});
