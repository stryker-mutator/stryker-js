import { expect } from 'chai';
import { CachedInputFileSystem } from 'enhanced-resolve';
import * as sinon from 'sinon';
import { IFs } from 'memfs';

import InputFileSystem from '../../../src/fs/InputFileSystem';
import memoryFS from '../../../src/fs/memory-fs';
import { createMockInstance, Mock } from '../../helpers/producers';

describe('InputFileSystem', () => {
  let sut: InputFileSystem;
  let memoryFSMock: sinon.SinonStubbedInstance<IFs>;
  let innerFSMock: Mock<CachedInputFileSystem>;

  beforeEach(() => {
    memoryFSMock = sinon.stub(memoryFS);
    innerFSMock = createMockInstance(CachedInputFileSystem);
    sut = new InputFileSystem(innerFSMock, (memoryFSMock as unknown) as IFs);
  });

  describe('writeFileSync', () => {
    it('should forward to memory fs', () => {
      sut.writeFileSync('path', 'content');
      expect(memoryFSMock.writeFileSync).calledWith('path', 'content');
    });
    it('should replace empty string content', () => {
      sut.writeFileSync('path', '');
      expect(memoryFSMock.writeFileSync).calledWith('path', ' ');
    });
    it('should mkdirp the directory', () => {
      sut.writeFileSync('path/to/file1.js', '');
      expect(memoryFSMock.mkdirpSync).calledWith('path/to');
    });
  });

  describe('stat', () => {
    it('should forward to memory fs', (done) => {
      memoryFSMock.stat.callsArgWith(1, undefined, 'foobar');
      sut.stat('arg1', (_error, value) => {
        expect(value).eq('foobar');
        expect(innerFSMock.stat).not.called;
        done();
      });
    });

    it('should forward to fs if memory FS resulted in an error', (done) => {
      memoryFSMock.stat.callsArgOnWith(1, sut, new Error('foobar'));
      innerFSMock.stat.callsArgWith(1, null, 'the stats');
      sut.stat('foobar', (error, stats) => {
        expect(error).not.ok;
        expect(stats).eq('the stats');
        done();
      });
    });

    it('should forward fs errors if file did not exist', (done) => {
      // Arrange
      const expectedError = new Error('File not exists');
      innerFSMock.stat.callsArgWith(1, expectedError);
      memoryFSMock.stat.callsArgOnWith(1, sut, new Error('foobar'));

      // Act
      sut.stat('foo/bar/not/exits', (err) => {
        // Assert
        expect(err).eq(expectedError);
        done();
      });
    });
  });

  describe('readFile', () => {
    it('should forward readFile to memory FS', (done) => {
      memoryFSMock.readFile.callsArgOnWith(2, sut, undefined, 'foobar');
      sut.readFile('path', {}, (_error: Error, value: string) => {
        expect(value).eq('foobar');
        expect(memoryFSMock.readFile).calledWith('path');
        expect(innerFSMock.readFile).not.called;
        done();
      });
    });

    it('should forward to real FS if memory-fs gave an error', (done) => {
      memoryFSMock.readFile.callsArgOnWith(1, sut, new Error('foobar'));
      innerFSMock.readFile.callsArgWith(1, undefined, 'the content');
      sut.readFile('foobar', (_error: Error, content: string) => {
        expect(content).eq('the content');
        expect(innerFSMock.readFile).calledWith('foobar');
        done();
      });
    });

    it('should forward fs errors if file did not exist', (done) => {
      // Arrange
      const expectedError = new Error('File not exists');
      innerFSMock.readFile.callsArgWith(1, expectedError);
      memoryFSMock.readFile.callsArgOnWith(1, sut, new Error('foobar'));

      // Act
      sut.readFile('foo/bar/not/exits', (error: Error) => {
        // Assert
        expect(error).eq(expectedError);
        done();
      });
    });
  });

  describe('statSync', () => {
    it('should forward to memory FS', () => {
      memoryFSMock.statSync.returns('foobar stats');
      const actual = sut.statSync('path');
      expect(actual).eq('foobar stats');
      expect(memoryFSMock.statSync).calledWith('path');
      expect(innerFSMock.statSync).not.called;
    });
    it('should forward to real FS if memory-fs gave an error', () => {
      memoryFSMock.statSync.throws(new Error('foobar'));
      innerFSMock.statSync.returns('foobar stats');
      const actual = sut.statSync('path');
      expect(actual).eq('foobar stats');
      expect(innerFSMock.statSync).calledWith('path');
    });
  });

  describe('readFileSync', () => {
    it('should forward to memory FS', () => {
      memoryFSMock.readFileSync.returns('foobar file');
      const actual = sut.readFileSync('path', 'utf8');
      expect(actual).eq('foobar file');
      expect(memoryFSMock.readFileSync).calledWith('path', 'utf8');
      expect(innerFSMock.readFileSync).not.called;
    });
    it('should forward to real FS if memory-fs gave an error', () => {
      const error = new Error('foobar');
      memoryFSMock.readFileSync.throws(error);
      innerFSMock.readFileSync.returns('foobar file');
      const actual = sut.readFileSync('path');
      expect(actual).eq('foobar file');
      expect(innerFSMock.readFileSync).calledWith('path');
    });
  });
});
