import { File } from '@stryker-mutator/api/core';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { Configuration } from 'webpack';

import * as webpack from '../../../src/compiler/Webpack';
import WebpackCompiler from '../../../src/compiler/WebpackCompiler';
import InputFileSystem from '../../../src/fs/InputFileSystem';
import OutputFileSystem from '../../../src/fs/OutputFileSystem';
import { WebpackCompilerMock } from '../../helpers/mockInterfaces';
import { createFakeWebpackConfig, createMockInstance, createTextFile, createWebpackMock, Mock } from '../../helpers/producers';

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
    sinon.stub(webpack, 'default').returns(webpackCompilerMock);
  });

  describe('writeFilesToFs', () => {
    beforeEach(() => {
      sut = new WebpackCompiler(fakeWebpackConfig, inputFileSystemMock as any, outputFileSystemMock as any);
    });

    it('should call the writeFile function on the inputFS with the given file', () => {
      const textFiles = createFakeTextFileArray();
      sut.writeFilesToFs(textFiles);

      textFiles.forEach((textFile) => {
        expect(inputFileSystemMock.writeFileSync).calledWith(textFile.name);
      });
    });
  });

  describe('emit', () => {
    let webpackRunStub: sinon.SinonStub;

    beforeEach(() => {
      sut = new WebpackCompiler(fakeWebpackConfig, inputFileSystemMock as any, outputFileSystemMock as any);
      webpackRunStub = sinon.stub(webpackCompilerMock, 'run').callsArgWith(0, null, { hasErrors: () => false });
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
      expect(outputFileSystemMock.collectFiles).calledWith();
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

  function createFakeTextFileArray(): File[] {
    return [
      createTextFile('path/to/awesome/directory/file1'),
      createTextFile('path/to/awesome/directory/file2'),
      createTextFile('path/to/awesome/directory/file3'),
      createTextFile('path/to/awesome/directory/file4')
    ];
  }
});
