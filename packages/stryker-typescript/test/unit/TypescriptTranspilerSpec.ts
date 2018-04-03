import TranspilingLanguageService, * as transpilingLanguageService from '../../src/transpiler/TranspilingLanguageService';
import * as log4js from 'log4js';
import { expect } from 'chai';
import { Mock, mock } from '../helpers/producers';
import TypescriptTranspiler from '../../src/TypescriptTranspiler';
import { Config } from 'stryker-api/config';
import { File } from 'stryker-api/core';
import { EmitOutput } from '../../src/transpiler/TranspilingLanguageService';
import { serialize } from 'surrial';
import TranspileFilter from '../../src/transpiler/TranspileFilter';

describe('TypescriptTranspiler', () => {

  let languageService: Mock<TranspilingLanguageService>;
  let sut: TypescriptTranspiler;
  let config: Config;
  let transpileFilterMock: Mock<TranspileFilter>;

  beforeEach(() => {
    config = new Config();
    languageService = mock(TranspilingLanguageService);
    transpileFilterMock = mock(TranspileFilter);
    // Add the isIncluded method as it is absent from the abstract class
    transpileFilterMock.isIncluded = sandbox.stub();
    sandbox.stub(TranspileFilter, 'create').returns(transpileFilterMock);
    sandbox.stub(transpilingLanguageService, 'default').returns(languageService);
    sandbox.stub(log4js, 'setGlobalLogLevel');
  });

  it('set global log level', () => {
    config.logLevel = 'foobar';
    sut = new TypescriptTranspiler({ config, produceSourceMaps: true });
    expect(log4js.setGlobalLogLevel).calledWith('foobar');
  });

  describe('transpile', () => {

    beforeEach(() => {
      languageService.getSemanticDiagnostics.returns([]); // no errors by default
      sut = new TypescriptTranspiler({ config, produceSourceMaps: true });
    });

    it('should transpile given files', async () => {
      // Arrange
      const expected = [
        new File('foo.js', 'foo'),
        new File('bar.js', 'bar')
      ];
      arrangeIncludedFiles();
      languageService.emit
        .withArgs('foo.ts').returns(multiResult(expected[0]))
        .withArgs('bar.ts').returns(multiResult(expected[1]));

      // Act
      const outputFiles = await sut.transpile([
        new File('foo.ts', ''),
        new File('bar.ts', '')
      ]);

      // Assert
      expectFilesEqual(outputFiles, expected);
    });

    it('should keep file order', async () => {
      // Arrange
      const input = [
        new File('file1.js', ''),
        new File('file2.ts', ''),
        new File('file4.ts', ''),
      ];
      arrangeIncludedFiles(input.slice(1));
      languageService.emit
        .withArgs('file2.ts').returns(multiResult(new File('file2.js', 'file2')))
        .withArgs('file4.ts').returns(multiResult(new File('file4.js', 'file4')));

      // Act
      const outputFiles = await sut.transpile(input);

      // Assert
      expectFilesEqual(outputFiles, [
        input[0],
        new File('file2.js', 'file2'),
        new File('file4.js', 'file4')
      ]);
    });

    it('should not transpile header files', async () => {
      // Arrange
      const input = [
        new File('file1.ts', ''),
        new File('file2.d.ts', ''),
      ];
      arrangeIncludedFiles();
      languageService.emit.returns(multiResult(new File('file1.js', '')));

      // Act
      const outputFiles = await sut.transpile(input);

      // Assert
      expectFilesEqual(outputFiles, [new File('file1.js', ''), input[1]]);
      expect(languageService.emit).calledOnce;
      expect(languageService.emit).calledWith('file1.ts');
    });

    it('should keep order if single output result file', async () => {
      // Arrange
      const input = [
        new File('file1.ts', 'file1'),
        new File('file2.ts', 'file2'),
        new File('file3.bin', Buffer.from([1, 2, 3])),
        new File('file4.ts', 'file4'),
        new File('file5.ts', 'file5')
      ];
      const allOutput = new File('allOutput.js', 'single output');
      const emitResult: EmitOutput = {
        singleResult: true,
        outputFiles: [allOutput]
      };
      languageService.emit.returns(emitResult);
      arrangeIncludedFiles([input[1], input[3]]);

      // Act
      const outputFiles = await sut.transpile(input);

      // Assert
      expectFilesEqual(outputFiles, [
        new File('file1.ts', 'file1'),
        allOutput,
        new File('file3.bin', Buffer.from([1, 2, 3])),
        new File('file5.ts', 'file5')
      ]);
      expect(languageService.emit).calledOnce;
      expect(languageService.emit).calledWith('file2.ts');
    });

    it('should reject errors when there are diagnostic messages', async () => {
      languageService.getSemanticDiagnostics.returns('foobar');
      arrangeIncludedFiles();
      const input = [new File('file1.ts', 'file1'), new File('file2.ts', 'file2')];
      return expect(sut.transpile(input)).rejectedWith('foobar');
    });
  });

  function expectFilesEqual(actual: ReadonlyArray<File>, expected: ReadonlyArray<File>) {
    expect(serialize(actual)).eq(serialize(expected));
  }

  function multiResult(file: File): EmitOutput {
    return {
      singleResult: false,
      outputFiles: [file]
    };
  }

  function arrangeIncludedFiles(files?: File[]) {
    if (files) {
      transpileFilterMock.isIncluded.callsFake((fileName: string) => files.some(file => file.name === fileName));
    } else {
      transpileFilterMock.isIncluded.returns(true);
    }
  }
});