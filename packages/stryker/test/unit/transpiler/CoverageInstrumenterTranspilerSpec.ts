import { expect } from 'chai';
import { Config } from 'stryker-api/config';
import { TextFile } from 'stryker-api/core';
import CoverageInstrumenterTranspiler from '../../../src/transpiler/CoverageInstrumenterTranspiler';
import { textFile, binaryFile, webFile, testFramework } from '../../helpers/producers';

describe('CoverageInstrumenterTranspiler', () => {
  let sut: CoverageInstrumenterTranspiler;
  let config: Config;

  beforeEach(() => {
    config = new Config();
  });

  it('should not instrument any code when coverage analysis is off', () => {
    sut = new CoverageInstrumenterTranspiler({ config, keepSourceMaps: false }, null);
    config.coverageAnalysis = 'off';
    const input = [textFile({ mutated: true }), binaryFile({ mutated: true }), webFile({ mutated: true })];
    const output = sut.transpile(input);
    expect(output.error).null;
    expect(output.outputFiles).deep.eq(input);
  });

  describe('when coverage analysis is "all"', () => {

    beforeEach(() => {
      config.coverageAnalysis = 'all';
      sut = new CoverageInstrumenterTranspiler({ config, keepSourceMaps: false }, null);
    });

    it('should instrument code of mutated files', () => {
      const input = [
        textFile({ mutated: true, content: 'function something() {}' }),
        binaryFile({ mutated: true }),
        webFile({ mutated: true }),
        textFile({ mutated: false })
      ];
      const output = sut.transpile(input);
      expect(output.error).null;
      expect(output.outputFiles[1]).eq(output.outputFiles[1]);
      expect(output.outputFiles[2]).eq(output.outputFiles[2]);
      expect(output.outputFiles[3]).eq(output.outputFiles[3]);
      const instrumentedContent = (output.outputFiles[0] as TextFile).content;
      expect(instrumentedContent).to.contain('function something(){__cov_').and.contain('.f[\'1\']++');
    });

    it('should create a statement map for mutated files', () => {
      const input = [
        textFile({ name: 'something.js', mutated: true, content: 'function something () {}' }),
        textFile({ name: 'foobar.js', mutated: true, content: 'console.log("foobar");' })
      ];
      sut.transpile(input);
      expect(sut.statementMapsPerFile).deep.eq({
        'something.js': { '1': { start: { line: 0, column: 0 }, end: { line: 0, column: 24 } } },
        'foobar.js': { '1': { start: { line: 0, column: 0 }, end: { line: 0, column: 22 } } }
      });
    });

    it('should fill error message and not transpile input when the file contains a parse error', () => {
      const invalidJavascriptFile = textFile({ name: 'invalid/file.js', content: 'function something {}', mutated: true });
      const output = sut.transpile([invalidJavascriptFile]);
      expect(output.error).contains('Could not instrument "invalid/file.js" for code coverage. Error: Line 1: Unexpected token {');
    });
  });

  describe('when coverage analysis is "perTest" and there is a testFramework', () => {
    let input: TextFile[];

    beforeEach(() => {
      config.coverageAnalysis = 'perTest';
      sut = new CoverageInstrumenterTranspiler({ config, keepSourceMaps: false }, testFramework());
      input = [textFile({ mutated: true, content: 'function something() {}' })];
    });

    it('should use the coverage variable "__strykerCoverageCurrentTest__"', () => {
      const output = sut.transpile(input);
      expect(output.error).null;
      const instrumentedContent = (output.outputFiles[1] as TextFile).content;
      expect(instrumentedContent).to.contain('__strykerCoverageCurrentTest__').and.contain('.f[\'1\']++');
    });

    it('should also add a collectCoveragePerTest file', () => {
      const output = sut.transpile(input);
      expect(output.error).null;
      expect(output.outputFiles).lengthOf(2);
      const actualContent = (output.outputFiles[0] as TextFile).content;
      expect(actualContent).to.have.length.greaterThan(30);
      expect(actualContent).to.contain('beforeEach()');
      expect(actualContent).to.contain('afterEach()');
    });
  });

  it('should result in an error if coverage analysis is "perTest" and there is no testFramework', () => {
    config.coverageAnalysis = 'perTest';
    sut = new CoverageInstrumenterTranspiler({ config, keepSourceMaps: true }, null);
    const output = sut.transpile([textFile({ content: 'a + b' })]);
    expect(output.error).eq('Cannot measure coverage results per test, there is no testFramework and thus no way of executing code right before and after each test.');
  });
});