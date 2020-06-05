import { expect } from 'chai';
import sinon from 'sinon';
import ts from 'typescript';

import { ScriptFile } from '../../../src/fs/script-file';

describe('fs', () => {
  describe(ScriptFile.name, () => {
    beforeEach(() => {
      sinon.useFakeTimers();
    });
    describe('constructor', () => {
      it('should reflect content, name and modified date', () => {
        const modifiedTime = new Date(2010, 1, 1, 2, 3, 4, 4);
        const sut = new ScriptFile('foo()', 'foo.js', modifiedTime);
        expect(sut.fileName).eq('foo.js');
        expect(sut.content).eq('foo()');
        expect(sut.modifiedTime).eq(modifiedTime);
      });

      it('should default modifiedDate to now', () => {
        const now = new Date(2010, 1, 2, 3, 4, 5, 6);
        sinon.clock.setSystemTime(now);
        const sut = new ScriptFile('', '');
        expect(sut.modifiedTime.valueOf()).eq(new Date(2010, 1, 2, 3, 4, 5, 6).valueOf());
      });
    });

    describe(ScriptFile.prototype.mutate.name, () => {
      let sut: ScriptFile;
      beforeEach(() => {
        sut = new ScriptFile('add(a, b) { return a + b };', 'add.js', new Date(2010, 1, 1));
        sut.watcher = sinon.stub();
      });

      it('should throw when no watcher is registered', () => {
        sut.watcher = undefined;
        expect(() => sut.mutate({ range: [21, 22], replacement: '-' })).throws('No watcher registered for add.js. Changes would go unnoticed');
      });

      it('should mutate the current content', () => {
        sut.mutate({ range: [21, 22], replacement: '-' });
        expect(sut.content).eq('add(a, b) { return a - b };');
      });

      it('should update the modified date', () => {
        // Arrange
        const now = new Date(2015, 1, 2, 3, 4, 5, 6);
        sinon.clock.setSystemTime(now);

        // Act
        sut.mutate({ range: [1, 2], replacement: '' });

        // Assert
        expect(sut.modifiedTime).deep.eq(now);
      });

      it('should notify the file system watcher', () => {
        sut.mutate({ range: [1, 2], replacement: '' });
        expect(sut.watcher).calledWith('add.js', ts.FileWatcherEventKind.Changed);
      });
    });

    describe(ScriptFile.prototype.resetMutant.name, () => {
      let sut: ScriptFile;

      beforeEach(() => {
        sut = new ScriptFile('add(a, b) { return a + b };', 'add.js', new Date(2010, 1, 1));
        sut.watcher = sinon.stub();
      });

      it('should reset the content after a mutation', () => {
        sut.mutate({ replacement: 'replaces', range: [0, sut.content.length] });
        sut.resetMutant();
        expect(sut.content).eq('add(a, b) { return a + b };');
      });

      it('should throw when no watcher is registered', () => {
        sut.watcher = undefined;
        expect(() => sut.resetMutant()).throws('No watcher registered for add.js. Changes would go unnoticed');
      });

      it('should reset the content after two mutations', () => {
        sut.mutate({ replacement: 'replaces', range: [0, sut.content.length] });
        sut.mutate({ replacement: 'replaced a second time', range: [0, sut.content.length] });
        sut.resetMutant();
        expect(sut.content).eq('add(a, b) { return a + b };');
      });

      it('should notify the file system watcher', () => {
        sut.resetMutant();
        expect(sut.watcher).calledWith('add.js', ts.FileWatcherEventKind.Changed);
      });

      it('should update the modified date', () => {
        // Arrange
        const now = new Date(2015, 1, 2, 3, 4, 5, 6);
        sinon.clock.setSystemTime(now);

        // Act
        sut.resetMutant();

        // Assert
        expect(sut.modifiedTime).deep.eq(now);
      });
    });

    describe(ScriptFile.prototype.write.name, () => {
      let sut: ScriptFile;

      beforeEach(() => {
        sut = new ScriptFile('add(a, b) { return a + b };', 'add.js', new Date(2010, 1, 1));
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
