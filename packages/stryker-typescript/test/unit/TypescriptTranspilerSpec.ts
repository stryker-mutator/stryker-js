import TranspilingLanguageService, * as transpilingLanguageService from '../../src/transpiler/TranspilingLanguageService';
import * as log4js from 'log4js';
import { expect } from 'chai';
import { Mock, mock, textFile, binaryFile } from '../helpers/producers';
import TypescriptTranspiler from '../../src/TypescriptTranspiler';
import { Config } from 'stryker-api/config';
import { TextFile } from 'stryker-api/core';


describe('TypescriptTranspiler', () => {

  let languageService: Mock<TranspilingLanguageService>;
  let sut: TypescriptTranspiler;
  let config: Config;

  beforeEach(() => {
    config = new Config();
    languageService = mock(TranspilingLanguageService);
    sandbox.stub(transpilingLanguageService, 'default').returns(languageService);
    sandbox.stub(log4js, 'setGlobalLogLevel');
  });

  it('set global log level', () => {
    config.logLevel = 'foobar';
    sut = new TypescriptTranspiler({ config, keepSourceMaps: true });
    expect(log4js.setGlobalLogLevel).calledWith('foobar');
  });

  describe('transpile', () => {
    let singleFileOutputEnabled: boolean;

    function makeOutputFile(file: TextFile) {
      const copy = Object.assign({}, file);
      if (file.name.endsWith('.ts') || file.name.endsWith('.js')) {
        copy.name = copy.name.replace('.ts', '.js');
        return copy;
      } else {
        throw new Error(`Could not transpile "${file.name}"`);
      }
    }

    function makeOutput(sourceFiles: TextFile[]) {
      if (singleFileOutputEnabled) {
        const singleFileOutput = Object.assign({}, sourceFiles[0], { name: 'allOutput.js' });
        return {
          [sourceFiles[0].name]: singleFileOutput
        };
      } else {
        return sourceFiles.reduce((map, sourceFile) => {
          map[sourceFile.name] = makeOutputFile(sourceFile);
          return map;
        }, Object.create(null));
      }
    }

    beforeEach(() => {
      singleFileOutputEnabled = false;
      languageService.getSemanticDiagnostics.returns([]); // no errors by default
      languageService.emit.callsFake(makeOutput);
      sut = new TypescriptTranspiler({ config, keepSourceMaps: true });
    });

    it('should transpile given files', async () => {
      const result = await sut.transpile([
        textFile({ name: 'foo.ts', transpiled: true }),
        textFile({ name: 'bar.ts', transpiled: true })
      ]);
      expect(result.error).eq(null);
      expect(result.outputFiles).deep.eq([
        textFile({ name: 'foo.js', transpiled: true }),
        textFile({ name: 'bar.js', transpiled: true })
      ]);
    });

    it('should keep file order', async () => {
      const input = [
        textFile({ name: 'file1.js', transpiled: false }),
        textFile({ name: 'file2.ts', transpiled: true }),
        binaryFile({ name: 'file3.bin', transpiled: true }),
        textFile({ name: 'file4.ts', transpiled: true }),
        textFile({ name: 'file5.d.ts', transpiled: true })
      ];
      const result = await sut.transpile(input);
      expect(result.error).eq(null);
      expect(result.outputFiles).deep.eq([
        textFile({ name: 'file1.js', transpiled: false }),
        textFile({ name: 'file2.js', transpiled: true }),
        binaryFile({ name: 'file3.bin', transpiled: true }),
        textFile({ name: 'file4.js', transpiled: true })
      ]);
    });

    it('should keep order if single output result file', async () => {
      singleFileOutputEnabled = true;
      const input = [
        textFile({ name: 'file1.ts', transpiled: false }),
        textFile({ name: 'file2.ts', transpiled: true }),
        binaryFile({ name: 'file3.bin' }),
        textFile({ name: 'file4.ts', transpiled: true }),
        textFile({ name: 'file5.ts', transpiled: false })
      ];
      const output = await sut.transpile(input);
      expect(output.error).eq(null);
      expect(output.outputFiles).deep.eq([
        textFile({ name: 'file1.ts', transpiled: false }),
        textFile({ name: 'allOutput.js', transpiled: true }),
        binaryFile({ name: 'file3.bin' }),
        textFile({ name: 'file5.ts', transpiled: false })
      ]);
    });

    it('should only emit valid typescript files', () => {
      const input = [
        textFile({ name: 'file1.ts', transpiled: true }), // OK
        textFile({ name: 'file2.ts', transpiled: false }), // NOK: transpiled: false
        binaryFile({ name: 'file3.ts' }), // NOK: binary file
        textFile({ name: 'file4.d.ts', transpiled: true }), // NOK: *.d.ts file
        textFile({ name: 'file5.js', transpiled: false }), // NOK: transpiled: false
        textFile({ name: 'file6.js', transpiled: true }) // OK, transpiled JS file
      ];
      sut.transpile(input);
      expect(languageService.emit).calledWith([
        textFile({ name: 'file1.ts', transpiled: true }),
        textFile({ name: 'file6.js', transpiled: true })
      ]);
    });

    it('should return errors when there are diagnostic messages', async () => {
      languageService.getSemanticDiagnostics.returns('foobar');
      const input = [textFile({ name: 'file1.ts' }), textFile({ name: 'file2.ts' })];
      const result = await sut.transpile(input);
      expect(result.error).eq('foobar');
      expect(result.outputFiles).lengthOf(0);
    });
  });
});