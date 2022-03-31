import fs from 'fs/promises';

import sinon from 'sinon';
import { expect } from 'chai';
import { testInjector } from '@stryker-mutator/test-helpers';

import { CachedFs } from '../../../src/fs/cached-fs.js';

describe('cached-fs unit test', () => {
  describe(CachedFs.name, () => {
    class Helper {
      public readFileStub = sinon.stub(fs, 'readFile');
    }
    let sut: CachedFs;
    let helper: Helper;
    beforeEach(() => {
      helper = new Helper();
      sut = testInjector.injector.injectClass(CachedFs);
    });

    describe(CachedFs.prototype.getFile.name, () => {
      it('should fallback to use fs.readFile', async () => {
        await sut.getFile('filename.ts');
        expect(helper.readFileStub).calledWithExactly('filename.ts', { encoding: 'utf-8' });
      });

      it('should cache files and only use fs once', async () => {
        await sut.getFile('filename.ts');
        await sut.getFile('filename.ts');
        expect(helper.readFileStub).calledOnceWithExactly('filename.ts', { encoding: 'utf-8' });
      });

      it('should get multiple files', async () => {
        await sut.getFile('filename-1.ts');
        await sut.getFile('filename-2.ts');
        expect(helper.readFileStub).calledWithExactly('filename-1.ts', { encoding: 'utf-8' });
        expect(helper.readFileStub).calledWithExactly('filename-2.ts', { encoding: 'utf-8' });
      });

      it('should throw errors if any occur', () => {
        helper.readFileStub.rejects(new Error('ENOENT: no such file or directory'));
        expect(sut.getFile('missing')).rejectedWith('ENOENT: no such file or directory');
      });
    });
  });
});
