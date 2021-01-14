import path = require('path');

import sinon = require('sinon');

import { expect } from 'chai';

import { DirectoryRequireCache } from '../../src';

describe(DirectoryRequireCache.name, () => {
  let workingDirectory: string;
  let sut: DirectoryRequireCache;
  let loadedFiles: Set<string>;
  let rootModule: NodeModule;

  beforeEach(() => {
    loadedFiles = new Set();
    workingDirectory = path.join('stub', 'working', 'dir');
    const cwdStub = sinon.stub(process, 'cwd').returns(workingDirectory);
    cwdStub.returns(workingDirectory);
    sut = new DirectoryRequireCache();
    rootModule = createModule('root', 'root');
    require.cache['root'] = rootModule;
  });

  afterEach(() => {
    for (const fileName of loadedFiles) {
      delete require.cache[fileName];
    }
    delete require.cache.root;
  });

  function fakeRequireFile(fileName: string, content = fileName, parent: NodeModule | null = rootModule) {
    loadedFiles.add(fileName);
    const child = createModule(content, fileName, parent);
    require.cache[fileName] = child;
    parent?.children.push(child);
    return child;
  }

  it('should clear the init files', () => {
    // Arrange
    const dir2 = path.join('stub', 'working', 'dir2');
    const fooFileName = path.join(dir2, 'foo.js');
    const barFileName = path.join(dir2, 'bar.js');
    const bazFileName = path.join(dir2, 'baz.js');
    fakeRequireFile(fooFileName, 'foo');
    fakeRequireFile(barFileName, 'foo');
    fakeRequireFile(bazFileName, 'baz');
    sut.init({ initFiles: [fooFileName, barFileName] });
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

  it('should only record the first time (perf optimization)', () => {
    // Arrange
    const fooFileName = path.join(workingDirectory, 'foo.js');
    const barFileName = path.join(workingDirectory, 'bar.js');
    fakeRequireFile(fooFileName, 'foo');
    sut.record();
    fakeRequireFile(barFileName, 'bar');
    sut.record();

    // Act
    sut.clear();

    // Assert
    expect(require.cache[fooFileName]).undefined;
    expect(require.cache[barFileName]).not.undefined;
    expect(rootModule.children).lengthOf(1);
  });

  it('should clear recorded children from their respective parent', () => {
    // Arrange
    const dir2 = path.join('stub', 'working', 'dir2');
    const fooFileName = path.join(workingDirectory, 'foo.js');
    const barFileName = path.join(workingDirectory, 'bar.js');
    const bazFileName = path.join(dir2, 'baz.js');
    fakeRequireFile(fooFileName, 'foo');
    fakeRequireFile(barFileName, 'foo');
    fakeRequireFile(bazFileName, 'baz');
    expect(rootModule.children).lengthOf(3);
    sut.init({ initFiles: [] });
    sut.record();

    // Act
    sut.clear();

    // Assert
    expect(rootModule.children).lengthOf(1);
    expect(rootModule.children[0].filename).eq(bazFileName);
  });

  it('should clear recorded separate unique parents', () => {
    // Arrange
    const fooParent = fakeRequireFile('parent1');
    const barParent = fakeRequireFile('parent2');
    const fooFileName = path.join(workingDirectory, 'foo.js');
    const barFileName = path.join(workingDirectory, 'bar.js');
    fakeRequireFile(fooFileName, 'foo', fooParent);
    fakeRequireFile(barFileName, 'bar', barParent);
    expect(fooParent.children).lengthOf(1);
    expect(barParent.children).lengthOf(1);
    sut.init({ initFiles: [] });
    sut.record();

    // Act
    sut.clear();

    // Assert
    expect(fooParent.children).lengthOf(0);
    expect(barParent.children).lengthOf(0);
  });

  it("should throw when the parent module wasn't loaded", () => {
    // Arrange
    sut.init({ initFiles: [] });
    fakeRequireFile(path.join(workingDirectory, 'foo.js'));
    sut.record();
    delete require.cache[rootModule.filename];

    // Act & assert
    expect(() => sut.clear()).throws('Could not find "root" in require cache.');
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

  it("should not fail when recorded file doesn't have a parent", () => {
    // Arrange
    const fooFileName = path.join(workingDirectory, 'foo.js');
    fakeRequireFile(fooFileName, 'foo', null);
    sut.record();

    // Act
    sut.clear();

    // Assert
    expect(require.cache[fooFileName]).undefined;
  });
  function createModule(content: string, fileName: string, parent: NodeModule | null = rootModule): NodeModule {
    return {
      exports: content,
      children: [],
      filename: fileName,
      id: fileName,
      loaded: true,
      parent,
      paths: [],
      require,
      path: '',
    };
  }
});
