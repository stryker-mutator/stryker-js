import sinon from 'sinon';
import ts from 'typescript';
import { expect } from 'chai';
import { testInjector } from '@stryker-mutator/test-helpers';

import { MemoryFileSystem } from '../../../src/fs/memory-filesystem';

describe('fs', () => {
  describe(MemoryFileSystem.name, () => {
    class Helper {
      public readFileStub = sinon.stub(ts.sys, 'readFile');
      public getModifiedTimeStub = sinon.stub(ts.sys, 'getModifiedTime');
    }
    let sut: MemoryFileSystem;
    let helper: Helper;
    beforeEach(() => {
      helper = new Helper();
      sut = testInjector.injector.injectClass(MemoryFileSystem);
    });

    describe(MemoryFileSystem.prototype.writeFile.name, () => {
      it('should create a new in-memory file', () => {
        sut.writeFile('add.js', 'a + b');
        const file = sut.getFile('add.js');
        expect(file).ok;
        expect(file!.content).eq('a + b');
        expect(file!.fileName).eq('add.js');
      });

      it('should override an existing file', () => {
        sut.writeFile('add.js', 'a + b');
        sut.writeFile('add.js', 'a - b');
        const file = sut.getFile('add.js');
        expect(file!.content).eq('a - b');
      });

      it('should convert path separator to forward slashes', () => {
        sut.writeFile('test\\foo\\a.js', 'a');
        const actual = sut.getFile('test/foo/a.js');
        expect(actual).ok;
        expect(actual!.content).eq('a');
      });
    });

    describe(MemoryFileSystem.prototype.getFile.name, () => {
      it("should read the file from disk if it wasn't loaded yet", () => {
        // Arrange
        const modifiedTime = new Date(2010, 1, 1);
        helper.readFileStub.returns('content from disk');
        helper.getModifiedTimeStub.returns(modifiedTime);

        // Act
        const actual = sut.getFile('foo.js');

        // Assert
        expect(helper.readFileStub).calledWith('foo.js');
        expect(helper.getModifiedTimeStub).calledWith('foo.js');
        expect(actual).ok;
        expect(actual!.fileName).eq('foo.js');
        expect(actual!.content).eq('content from disk');
        expect(actual!.modifiedTime).eq(modifiedTime);
      });

      it('should convert path separator to forward slashes', () => {
        helper.readFileStub.returns('content from disk');
        helper.getModifiedTimeStub.returns(new Date(2010, 1, 1));
        sut.getFile('test\\foo\\a.js');
        expect(helper.readFileStub).calledOnce;
        expect(helper.readFileStub).calledWith('test/foo/a.js');
        expect(helper.getModifiedTimeStub).calledWith('test/foo/a.js');
      });

      it('should support empty files', () => {
        helper.readFileStub.returns('');
        helper.getModifiedTimeStub.returns(new Date(2010, 1, 1));
        const actual = sut.getFile('foo.js');
        expect(actual).ok;
        expect(actual!.fileName).eq('foo.js');
        expect(actual!.content).eq('');
      });

      it("should cache a file that doesn't exists", () => {
        sut.getFile('not-exists.js');
        sut.getFile('not-exists.js');
        expect(helper.readFileStub).calledOnce;
      });
    });
  });
});
