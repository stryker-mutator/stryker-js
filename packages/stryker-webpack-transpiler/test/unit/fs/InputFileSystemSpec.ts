import MemoryFS, * as memoryFSModule from '../../../src/fs/MemoryFS';
import InputFileSystem from '../../../src/fs/InputFileSystem';
import * as fs from 'fs';
import { expect } from 'chai';
import { Mock, createMockInstance } from '../../helpers/producers';

describe('InputFileSystem', () => {
  let sut: InputFileSystem;
  let memoryFSMock: Mock<MemoryFS>;
  let fsMock: Mock<MemoryFS>;

  beforeEach(() => {
    memoryFSMock = createMockInstance(MemoryFS);
    fsMock = Object.create(null);
    sandbox.stub(memoryFSModule, 'default').returns(memoryFSMock);
    actions('readdirSync', 'readFileSync', 'readFile', 'stat', 'readdir', 'readlink', 'statSync')
      .forEach(action => fsMock[action] = sandbox.stub(fs, action));
    sut = new InputFileSystem();
  });

  describe('writeFileSync', () => {
    it(`should forward to memory fs`, () => {
      memoryFSMock.writeFileSync.returns('foobar');
      expect(sut.writeFileSync('path', 'content')).eq('foobar');
      expect(memoryFSMock.writeFileSync).calledWith('path', 'content');
    });
    it(`should replace empty string content`, () => {
      memoryFSMock.writeFileSync.returns('foobar');
      expect(sut.writeFileSync('path', '')).eq('foobar');
      expect(memoryFSMock.writeFileSync).calledWith('path', ' ');
    });
  });

  actions('readdir', 'readlink').forEach(action => {
    describe(action, () => {
      it(`should forward to memory fs`, (done) => {
        memoryFSMock[action].callsArgWith(1, undefined, 'foobar');
        (sut[action] as any)('arg1', (error: any, value: string) => {
          expect(value).eq('foobar');
          expect(fs[action]).not.called;
          done();
        });
      });
      it('should forward to real FS if in-memory FS resulted in an error', () => {
        memoryFSMock[action].callsArgWith(1, new Error('foobar'));
        const callback = sandbox.stub();
        (sut[action] as any)('arg1', callback);
        expect(fs[action]).calledWith('arg1', callback);
      });
    });
  });

  describe('stat', () => {

    it('should forward to memory fs', done => {
      memoryFSMock.stat.callsArgWith(1, undefined, 'foobar');
      sut.stat('arg1', (error, value) => {
        expect(value).eq('foobar');
        expect(fs.stat).not.called;
        done();
      });
    });

    it('should pull the file into memory if file did not exist in-memory', () => {
      // Arrange
      fsMock.readFile.callsArgWith(2, undefined, 'content from fs');
      memoryFSMock.stat
        .onFirstCall().callsArgOnWith(1, sut, new Error('foobar'))
        .onSecondCall().callsArgOnWith(1, sut, null, 'the stats');
      const callback = sandbox.stub();

      // Act
      sut.stat('foo/bar', callback);

      // Assert
      expect(callback).calledWith(null, 'the stats');
      expectFilePulledIntoMemory('foo/bar', 'content from fs');
    });

    it('should forward fs errors if file did not exist', () => {
      // Arrange
      const expectedError = new Error('File not exists');
      fsMock.readFile.callsArgWith(2, expectedError);
      memoryFSMock.stat.callsArgOnWith(1, sut, new Error('foobar'));
      const callback = sandbox.stub();

      // Act
      sut.stat('foo/bar/not/exits', callback);

      // Assert
      expect(callback).calledWith(expectedError);
      expect(memoryFSMock.writeFileSync).not.called;
      expect(logMock.debug).not.called;
    });
  });

  describe('readFile', () => {

    it('should forward readFile to memory FS', done => {
      memoryFSMock.readFile.callsArgOnWith(2, sut, undefined, 'foobar');
      sut.readFile('path', {}, (error: any, value: string) => {
        expect(value).eq('foobar');
        expect(memoryFSMock.readFile).calledWith('path');
        expect(fs.readFile).not.called;
        done();
      });
    });

    it('should forward without options if options are missing', done => {
      memoryFSMock.readFile.callsArgOnWith(2, sut, undefined, 'foobar');
      sut.readFile('path', (error: any, value: string) => {
        expect(value).eq('foobar');
        expect(memoryFSMock.readFile).calledWith('path', undefined);
        done();
      });
    });

    it('should pull the file into memory if file did not exist', () => {
      // Arrange
      fsMock.readFile.callsArgWith(2, undefined, 'content from fs');
      memoryFSMock.readFile.callsArgOnWith(2, sut, new Error('foobar'));
      const callback = sandbox.stub();

      // Act
      sut.readFile('foo/bar', callback);

      // Assert
      expect(callback).calledWith(null, 'content from fs');
      expectFilePulledIntoMemory('foo/bar', 'content from fs');
    });

    it('should forward fs errors if file did not exist', () => {
      // Arrange
      const expectedError = new Error('File not exists');
      fsMock.readFile.callsArgWith(2, expectedError);
      memoryFSMock.readFile.callsArgOnWith(2, sut, new Error('foobar'));
      const callback = sandbox.stub();

      // Act
      sut.readFile('foo/bar/not/exits', callback);

      // Assert
      expect(callback).calledWith(expectedError);
      expect(memoryFSMock.writeFileSync).not.called;
      expect(logMock.debug).not.called;
    });
  });

  describe('statSync', () => {
    it('should forward to memory FS', () => {
      memoryFSMock.statSync.returns('foobar stats');
      const actual = sut.statSync('path');
      expect(actual).eq('foobar stats');
      expect(memoryFSMock.statSync).calledWith('path');
      expect(fs.statSync).not.called;
    });
    it('should forward to real FS if memory-fs gave an error', () => {
      memoryFSMock.statSync.throws(new Error('foobar'));
      fsMock.statSync.returns('foobar stats');
      const actual = sut.statSync('path');
      expect(actual).eq('foobar stats');
      expect(fs.statSync).calledWith('path');
    });
  });

  describe('readdirSync', () => {
    it('should forward to memory FS', () => {
      memoryFSMock.readdirSync.returns('foobar dirs');
      const actual = sut.readdirSync('path');
      expect(actual).eq('foobar dirs');
      expect(memoryFSMock.readdirSync).calledWith('path');
      expect(fs.readdirSync).not.called;
    });
    it('should forward to real FS if memory-fs gave an ENOTDIR error', () => {
      const error: any = new Error();
      error.code = 'ENOTDIR';
      memoryFSMock.readdirSync.throws(error);
      fsMock.readdirSync.returns('foobar dirs');
      const actual = sut.readdirSync('path');
      expect(actual).eq('foobar dirs');
      expect(fs.readdirSync).calledWith('path');
    });
    it('should re throw if memory-fs gave an error', () => {
      const error = new Error('foobar');
      memoryFSMock.readdirSync.throws(error);
      expect(() => sut.readdirSync('path')).throws(error);
      expect(fs.readdirSync).not.called;
    });
  });

  describe('readFileSync', () => {
    it('should forward to memory FS', () => {
      memoryFSMock.readFileSync.returns('foobar file');
      const actual = sut.readFileSync('path', 'utf8');
      expect(actual).eq('foobar file');
      expect(memoryFSMock.readFileSync).calledWith('path', 'utf8');
      expect(fs.readFileSync).not.called;
    });
    it('should forward to real FS if memory-fs gave an ENOTDIR error', () => {
      const error: any = new Error();
      error.code = 'ENOENT';
      memoryFSMock.readFileSync.throws(error);
      fsMock.readFileSync.returns('foobar file');
      const actual = sut.readFileSync('path', 'utf8');
      expect(actual).eq('foobar file');
      expect(fs.readFileSync).calledWith('path', 'utf8');
    });
    it('should forward to real FS if memory-fs gave an error', () => {
      const expectedError = new Error('foobar');
      memoryFSMock.readFileSync.throws(expectedError);
      expect(() => sut.readFileSync('path', 'utf8')).throws(expectedError);
      expect(fs.readFileSync).not.called;
    });
  });

  function actions(...actions: Array<'stat' | 'readdir' | 'readlink' | 'readdirSync' | 'readFile' | 'readFileSync' | 'statSync' | 'writeFileSync'>) {
    return actions;
  }

  function expectFilePulledIntoMemory(fileName: string, content: string) {
    expect(fs.readFile).calledWith(fileName);
    expect(memoryFSMock.mkdirpSync).calledWith('foo');
    expect(memoryFSMock.writeFileSync).calledWith(fileName, content);
    expect(logMock.debug).calledWith('Pulling file into memory: %s', fileName);
  }
});