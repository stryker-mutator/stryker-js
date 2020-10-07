import path = require('path');

import sinon = require('sinon');

import { expect } from 'chai';

import { DirectoryRequireCache } from '../../src';

describe(DirectoryRequireCache.name, () => {
  let workingDirectory: string;
  let sut: DirectoryRequireCache;
  let loadedFiles: Map<string, string>;
  let rootModule: NodeModule;

  beforeEach(() => {
    loadedFiles = new Map();
    workingDirectory = path.join('stub', 'working', 'dir');
    const cwdStub = sinon.stub(process, 'cwd').returns(workingDirectory);
    cwdStub.returns(workingDirectory);
    sut = new DirectoryRequireCache();
    rootModule = createModule('root', 'root');
    require.cache['root'] = rootModule;
  });

  afterEach(() => {
    for (const fileName of loadedFiles.keys()) {
      delete require.cache[fileName];
    }
  });

  function fakeRequireFile(fileName: string, content = fileName, requiredBy = rootModule) {
    loadedFiles.set(fileName, content);
    const child = createModule(content, fileName);
    require.cache[fileName] = child;
    requiredBy.children.push(child);
  }

  describe(DirectoryRequireCache.prototype.clear.name, () => {
    it('should clear the init files', () => {
      // Arrange
      const dir2 = path.join('stub', 'working', 'dir2');
      const fooFileName = path.join(dir2, 'foo.js');
      const barFileName = path.join(dir2, 'bar.js');
      const bazFileName = path.join(dir2, 'baz.js');
      fakeRequireFile(fooFileName, 'foo');
      fakeRequireFile(barFileName, 'foo');
      fakeRequireFile(bazFileName, 'baz');
      sut.init({ initFiles: [fooFileName, barFileName], rootModuleId: 'root' });
      sut.record();

      // Act
      sut.clear();

      // Assert
      expect(require.cache[fooFileName]).undefined;
      expect(require.cache[barFileName]).undefined;
      expect(require.cache[bazFileName]?.exports).eq('baz');
    });

    it('should clear recorded files', () => {
      // Arrange
      const dir2 = path.join('stub', 'working', 'dir2');
      const fooFileName = path.join(workingDirectory, 'foo.js');
      const barFileName = path.join(workingDirectory, 'bar.js');
      const bazFileName = path.join(dir2, 'baz.js');
      fakeRequireFile(fooFileName, 'foo');
      fakeRequireFile(barFileName, 'foo');
      fakeRequireFile(bazFileName, 'baz');
      sut.record();

      // Act
      sut.clear();

      // Assert
      expect(require.cache[fooFileName]).undefined;
      expect(require.cache[barFileName]).undefined;
      expect(require.cache[bazFileName]?.exports).eq('baz');
    });

    it('should clear recorded children from the root', () => {
      // Arrange
      const dir2 = path.join('stub', 'working', 'dir2');
      const fooFileName = path.join(workingDirectory, 'foo.js');
      const barFileName = path.join(workingDirectory, 'bar.js');
      const bazFileName = path.join(dir2, 'baz.js');
      fakeRequireFile(fooFileName, 'foo');
      fakeRequireFile(barFileName, 'foo');
      fakeRequireFile(bazFileName, 'baz');
      expect(rootModule.children).lengthOf(3);
      sut.init({ initFiles: [], rootModuleId: 'root' });
      sut.record();

      // Act
      sut.clear();

      // Assert
      expect(rootModule.children).lengthOf(1);
      expect(rootModule.children[0].filename).eq(bazFileName);
    });

    it("should throw when the root module wasn't loaded", () => {
      // Arrange
      sut.init({ initFiles: [], rootModuleId: 'not-exists' });
      sut.record();

      // Act
      expect(() => sut.clear()).throws('Could not find "not-exists" in require cache.');
    });

    it('should not clear files from node_modules', () => {
      // Arrange
      const fooFileName = path.join(workingDirectory, 'foo.js');
      const bazFileName = path.join(workingDirectory, 'node_modules', 'baz.js');
      fakeRequireFile(fooFileName, 'foo');
      fakeRequireFile(bazFileName, 'baz');
      sut.record();

      // Act
      sut.clear();

      // Assert
      expect(require.cache[fooFileName]).undefined;
      expect(require.cache[bazFileName]?.exports).eq('baz');
    });
  });
});
function createModule(content: string, fileName: string): NodeModule {
  return {
    exports: content,
    children: [],
    filename: fileName,
    id: fileName,
    loaded: true,
    parent: null,
    paths: [],
    require,
    path: '',
  };
}
