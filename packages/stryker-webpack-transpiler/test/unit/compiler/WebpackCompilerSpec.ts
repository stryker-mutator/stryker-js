import { expect } from 'chai';
import { createFakeWebpackConfig, createTextFile, createWebpackMock, Mock, createMockInstance } from '../../helpers/producers';
import { WebpackCompilerMock } from '../../helpers/mockInterfaces';
import InputFileSystem, * as inputFileSystemModule from '../../../src/fs/InputFileSystem';
import OutputFileSystem, * as outputFileSystemModule from '../../../src/fs/OutputFileSystem';
import WebpackCompiler from '../../../src/compiler/WebpackCompiler';
import { TextFile } from 'stryker-api/core';
import * as path from 'path';
import * as webpack from '../../../src/compiler/Webpack';
import { Configuration, Plugin } from 'webpack';
import OutputSorterPlugin from '../../../src/compiler/OutputSorterPlugin';

describe('WebpackCompiler', () => {
  let sut: WebpackCompiler;
  let inputFileSystemMock: Mock<InputFileSystem>;
  let outputFileSystemMock: Mock<OutputFileSystem>;
  let webpackCompilerMock: WebpackCompilerMock;

  let fakeWebpackConfig: Configuration;

  beforeEach(() => {
    inputFileSystemMock = createMockInstance(InputFileSystem);
    outputFileSystemMock = createMockInstance(OutputFileSystem);
    webpackCompilerMock = createWebpackMock();
    fakeWebpackConfig = createFakeWebpackConfig();

    sandbox.stub(webpack, 'default').returns(webpackCompilerMock);
    sandbox.stub(inputFileSystemModule, 'default').returns(inputFileSystemMock);
    sandbox.stub(outputFileSystemModule, 'default').returns(outputFileSystemMock);
  });

  it('should add the OutputSorterPlugin to the list of plugins', () => {
    new WebpackCompiler(fakeWebpackConfig);
    const plugins = (fakeWebpackConfig.plugins as Plugin[]);
    expect(plugins[plugins.length - 1]).instanceOf(OutputSorterPlugin);
  });

  describe('writeFilesToFs', () => {

    beforeEach(() => {
      sut = new WebpackCompiler(fakeWebpackConfig);
    });

    it('should call the mkdirp function on the inputFS with the basedir of the given file', () => {
      const textFiles = createFakeTextFileArray();
      sut.writeFilesToFs(textFiles);

      textFiles.forEach((textFile, index) => {
        expect(inputFileSystemMock.mkdirpSync).calledWith(path.dirname(textFile.name));
      });
    });

    it('should call the writeFile function on the inputFS with the given file', () => {
      const textFiles = createFakeTextFileArray();
      sut.writeFilesToFs(textFiles);

      textFiles.forEach((textFile, index) => {
        expect(inputFileSystemMock.writeFileSync).calledWith(textFile.name);
      });
    });
  });

  describe('emit', () => {
    let webpackRunStub: sinon.SinonStub;

    beforeEach(() => {
      sut = new WebpackCompiler(fakeWebpackConfig);
      webpackRunStub = sandbox.stub(webpackCompilerMock, 'run').callsArgWith(0, null, { hasErrors: () => false });
    });

    it('should call the run function on the webpack compiler', async () => {
      outputFileSystemMock.collectFiles.returns([]);
      await sut.emit();
      expect(webpackRunStub).calledOnce;
    });

    it('should collect files from the outputFS', async () => {
      const expectedFiles = [{ name: 'foobar' }];
      outputFileSystemMock.collectFiles.returns(expectedFiles);
      const actualResult = await sut.emit();

      expect(actualResult).eq(expectedFiles);
    });

    it('should sort the files based on the sorter plugin', async () => {
      // Arrange
      outputFileSystemMock.collectFiles.returns([{ name: path.resolve('3') }, { name: '1' }, { name: '2' }]);
      const outputSorterPlugin = (fakeWebpackConfig as any).plugins[0] as OutputSorterPlugin;
      outputSorterPlugin.sortedFileNames = ['1', '2', '3'];

      // Act
      const actualResult = await sut.emit();

      // Assert
      expect(actualResult).deep.eq([{ name: '1' }, { name: '2' }, { name: path.resolve('3') }]);
    });

    it('should return an error when the webpack compiler fails to compile', async () => {
      const fakeError: string = 'fakeError';
      webpackRunStub.callsArgWith(0, new Error(fakeError));

      try {
        await sut.emit();

        expect.fail('Function should throw an error!');
      } catch (err) {
        expect(err.name).to.equal('Error');
        expect(err.message).to.equal(fakeError);
      }
    });

    it('should return a string representation of the error when the compiler has errors', async () => {
      const fakeError: string = 'fakeError';
      webpackRunStub.callsArgWith(0, null, {
        hasErrors: () => true,
        toString: () => fakeError
      });

      try {
        await sut.emit();

        expect.fail(null, null, 'Function should throw an error!');
      } catch (err) {
        expect(err.name).to.equal('Error');
        expect(err.message).to.equal(fakeError);
      }
    });
  });

  function createFakeTextFileArray(): Array<TextFile> {
    return [
      createTextFile('path/to/awesome/directory/file1'),
      createTextFile('path/to/awesome/directory/file2'),
      createTextFile('path/to/awesome/directory/file3'),
      createTextFile('path/to/awesome/directory/file4')
    ];
  }
});