import path from 'path';

import { expect } from 'chai';
import sinon from 'sinon';

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
    require.cache.root = rootModule;
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
    sut.record();

    // Act
    sut.clear();

    // Assert
    expect(fooParent.children).lengthOf(0);
    expect(barParent.children).lengthOf(0);
  });

  it('should not break when clearing a graph', () => {
    // Arrange
    const grandParentFileName = 'grandparent.js';
    const parentFileName = path.join(workingDirectory, 'child.spec.js');
    const childFileName = path.join(workingDirectory, 'child.js');
    const grandparentModule = fakeRequireFile(grandParentFileName);
    const parentModule = fakeRequireFile(parentFileName, 'parent', grandparentModule);
    fakeRequireFile(childFileName, 'foo', parentModule);
    expect(grandparentModule.children).lengthOf(1);
    expect(parentModule.children).lengthOf(1);
    sut.record();

    // Act
    sut.clear();

    // Assert
    expect(grandparentModule.children).lengthOf(0);
    expect(require.cache[childFileName]).undefined;
    expect(require.cache[parentFileName]).undefined;
    expect(require.cache[grandParentFileName]).eq(grandparentModule);
  });

  it('should not throw when the parent module was unloaded', () => {
    // Arrange
    fakeRequireFile(path.join(workingDirectory, 'foo.js'));
    sut.record();
    delete require.cache[rootModule.filename];

    // Act & assert
    sut.clear();
  });

  it('should not throw when the parent module is one of the modules to being cleared', () => {
    // Arrange
    const fooSpec = path.join(workingDirectory, 'foo.spec.js');
    const foo = path.join(workingDirectory, 'foo.js');
    const app = path.join(workingDirectory, 'app.js');
    const fooSpecModule = fakeRequireFile(fooSpec);
    const fooModule = fakeRequireFile(foo, 'foo', fooSpecModule);
    fakeRequireFile(app, 'app', fooModule);

    // Act
    sut.record();
    sut.clear();

    // Assert
    expect(require.cache[fooSpec]).undefined;
    expect(require.cache[app]).undefined;
    expect(require.cache[foo]).undefined;
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
