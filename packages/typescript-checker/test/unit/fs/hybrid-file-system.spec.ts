import sinon from 'sinon';
import ts from 'typescript';
import { expect } from 'chai';
import { testInjector } from '@stryker-mutator/test-helpers';

import { HybridFileSystem } from '../../../src/fs/index.js';

describe('fs', () => {
  describe(HybridFileSystem.name, () => {
    class Helper {
      public readFileStub = sinon.stub(ts.sys, 'readFile');
      public getModifiedTimeStub = sinon.stub(ts.sys, 'getModifiedTime');
    }
    let sut: HybridFileSystem;
    let helper: Helper;
    beforeEach(() => {
      helper = new Helper();
      sut = testInjector.injector.injectClass(HybridFileSystem);
    });

    describe(HybridFileSystem.prototype.writeFile.name, () => {
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

    describe(HybridFileSystem.prototype.getFile.name, () => {
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

    describe(HybridFileSystem.prototype.watchFile.name, () => {
      it('should register a watcher', () => {
        // Arrange
        helper.readFileStub.returns('foobar');
        const watcherCallback = sinon.stub();

        // Act
        sut.writeFile('foo.js', 'some-content');
        sut.watchFile('foo.js', watcherCallback);
        sut.writeFile('foo.js', 'some-content');

        // Asset
        expect(watcherCallback).calledWith(
          'foo.js',
          ts.FileWatcherEventKind.Changed,
        );
      });

      it('should convert path separator to forward slashes', () => {
        helper.readFileStub.returns('content from disk');
        helper.getModifiedTimeStub.returns(new Date(2010, 1, 1));
        sut.watchFile('test\\foo\\a.js', sinon.stub());
        expect(helper.readFileStub).calledWith('test/foo/a.js');
      });

      it('should log that the file is watched', () => {
        helper.readFileStub.returns('foobar');
        const watcherCallback = sinon.stub();
        sut.watchFile('foo.js', watcherCallback);
        expect(testInjector.logger.trace).calledWith(
          'Registering watcher for file "%s"',
          'foo.js',
        );
      });
    });
    describe(HybridFileSystem.prototype.existsInMemory.name, () => {
      it('should return true if file does exists', () => {
        const fileName = 'test-file';
        sut.writeFile(fileName, '');
        expect(sut.existsInMemory(fileName)).true;
      });
      it('should return false if file does not exists', () => {
        const fileName = 'test-file';
        expect(sut.existsInMemory(fileName)).false;
      });
    });
  });
});
