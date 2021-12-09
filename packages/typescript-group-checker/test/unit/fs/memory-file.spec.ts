import sinon from 'sinon';
import { expect } from 'chai';
import ts from 'typescript';

import { File } from '../../../src/fs/memory-file';

describe('fs', () => {
  describe(File.name, () => {
    beforeEach(() => {
      sinon.useFakeTimers();
    });
    describe('constructor', () => {
      it('should reflect content, name and modified date', () => {
        const modifiedTime = new Date(2010, 1, 1, 2, 3, 4, 4);
        const sut = new File('foo.js', 'foo()', modifiedTime);
        expect(sut.fileName).eq('foo.js');
        expect(sut.content).eq('foo()');
        expect(sut.modifiedTime).eq(modifiedTime);
      });

      it('should default modifiedDate to now', () => {
        const now = new Date(2010, 1, 2, 3, 4, 5, 6);
        sinon.clock.setSystemTime(now);
        const sut = new File('', '');
        expect(sut.modifiedTime.valueOf()).eq(new Date(2010, 1, 2, 3, 4, 5, 6).valueOf());
      });
    });

    describe(File.prototype.mutate.name, () => {
      let sut: File;
      beforeEach(() => {
        sut = new File('add.js', 'add(a, b) { return a + b };', new Date(2010, 1, 1));
        sut.watcher = sinon.stub();
      });

      it('should throw when no watcher is registered', () => {
        sut.watcher = undefined;
        expect(() => sut.mutate({ location: { start: { line: 0, column: 21 }, end: { line: 0, column: 22 } }, replacement: '-' })).throws(
          'Tried to check file "add.js" (which is part of your typescript project), but no watcher is registered for it. Changes would go unnoticed. This probably means that you need to expand the files that are included in your project'
        );
      });

      it('should mutate the current content', () => {
        sut.mutate({ location: { start: { line: 0, column: 21 }, end: { line: 0, column: 22 } }, replacement: '-' });
        expect(sut.content).eq('add(a, b) { return a - b };');
      });

      it('should update the modified date', () => {
        // Arrange
        const now = new Date(2015, 1, 2, 3, 4, 5, 6);
        sinon.clock.setSystemTime(now);

        // Act
        sut.mutate({ location: { start: { line: 0, column: 1 }, end: { line: 0, column: 2 } }, replacement: '' });

        // Assert
        expect(sut.modifiedTime).deep.eq(now);
      });

      it('should notify the file system watcher', () => {
        sut.mutate({ location: { start: { line: 0, column: 1 }, end: { line: 0, column: 2 } }, replacement: '' });
        expect(sut.watcher).calledWith('add.js', ts.FileWatcherEventKind.Changed);
      });
    });

    describe(File.prototype.reset.name, () => {
      let sut: File;

      beforeEach(() => {
        sut = new File('add.js', 'add(a, b) { return a + b };', new Date(2010, 1, 1));
        sut.watcher = sinon.stub();
      });

      it('should reset the content after a mutation', () => {
        sut.mutate({ replacement: 'replaces', location: { start: { line: 0, column: 1 }, end: { line: 0, column: sut.content.length } } });
        sut.reset();
        expect(sut.content).eq('add(a, b) { return a + b };');
      });

      it('should throw when no watcher is registered', () => {
        sut.watcher = undefined;
        expect(() => sut.reset()).throws(
          'ried to check file "add.js" (which is part of your typescript project), but no watcher is registered for it. Changes would go unnoticed. This probably means that you need to expand the files that are included in your project'
        );
      });

      it('should reset the content after two mutations', () => {
        sut.mutate({ replacement: 'replaces', location: { start: { line: 0, column: 1 }, end: { line: 0, column: sut.content.length } } });
        sut.mutate({
          replacement: 'replaced a second time',
          location: { start: { line: 0, column: 1 }, end: { line: 0, column: sut.content.length } },
        });
        sut.reset();
        expect(sut.content).eq('add(a, b) { return a + b };');
      });

      it('should notify the file system watcher', () => {
        sut.reset();
        expect(sut.watcher).calledWith('add.js', ts.FileWatcherEventKind.Changed);
      });

      it('should update the modified date', () => {
        // Arrange
        const now = new Date(2015, 1, 2, 3, 4, 5, 6);
        sinon.clock.setSystemTime(now);

        // Act
        sut.reset();

        // Assert
        expect(sut.modifiedTime).deep.eq(now);
      });
    });

    describe(File.prototype.write.name, () => {
      let sut: File;

      beforeEach(() => {
        sut = new File('add.js', 'add(a, b) { return a + b };', new Date(2010, 1, 1));
      });

      it('should write to the content', () => {
        sut.write('overridden');
        expect(sut.content).eq('overridden');
      });

      it('should inform the fs watcher', () => {
        sut.watcher = sinon.stub();
        sut.write('overridden');
        expect(sut.watcher).calledWith('add.js', ts.FileWatcherEventKind.Changed);
      });

      it('should update the modified date', () => {
        // Arrange
        const now = new Date(2015, 1, 2, 3, 4, 5, 6);
        sinon.clock.setSystemTime(now);

        // Act
        sut.write('overridden');

        // Assert
        expect(sut.modifiedTime).deep.eq(now);
      });
    });
  });
});
