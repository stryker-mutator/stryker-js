import { File, StrykerOptions } from '@stryker-mutator/api/core';
import { expect } from 'chai';
import { factory } from '@stryker-mutator/test-helpers';

import CoverageInstrumenterTranspiler from '../../../src/transpiler/CoverageInstrumenterTranspiler';

describe('CoverageInstrumenterTranspiler', () => {
  let sut: CoverageInstrumenterTranspiler;
  let options: StrykerOptions;

  beforeEach(() => {
    options = factory.strykerOptions();
  });

  it('should not instrument any code when coverage analysis is off', async () => {
    sut = new CoverageInstrumenterTranspiler(options, ['foobar.js']);
    options.coverageAnalysis = 'off';
    const input = [new File('foobar.js', '')];
    const outputFiles = await sut.transpile(input);
    expect(outputFiles).deep.eq(input);
  });

  describe('when coverage analysis is "all"', () => {
    beforeEach(() => {
      options.coverageAnalysis = 'all';
      sut = new CoverageInstrumenterTranspiler(options, ['mutate.js']);
    });

    it('should instrument code of mutated files', async () => {
      const input = [new File('mutate.js', 'function something() {}'), new File('spec.js', '')];
      const outputFiles = await sut.transpile(input);
      const instrumentedContent = outputFiles[0].textContent;
      expect(instrumentedContent)
        .to.contain('function something(){cov_')
        .and.contain('.f[0]++');
    });

    it('should preserve source map comments', async () => {
      const input = [new File('mutate.js', 'function something() {} // # sourceMappingUrl="something.map.js"')];
      const outputFiles = await sut.transpile(input);
      const instrumentedContent = outputFiles[0].textContent;
      expect(instrumentedContent).to.contain('sourceMappingUrl="something.map.js"');
    });

    it('should create a statement map for mutated files', () => {
      const input = [new File('mutate.js', 'function something () {}'), new File('foobar.js', 'console.log("foobar");')];
      sut.transpile(input);
      expect(sut.fileCoverageMaps['mutate.js'].statementMap).deep.eq({});
      expect(sut.fileCoverageMaps['mutate.js'].fnMap[0]).deep.eq({ start: { line: 0, column: 22 }, end: { line: 0, column: 24 } });
      expect(sut.fileCoverageMaps['mutate.js'].fnMap[1]).undefined;
      expect(sut.fileCoverageMaps['foobar.js']).undefined;
    });

    it('should fill error message and not transpile input when the file contains a parse error', async () => {
      const invalidJavascriptFile = new File('mutate.js', 'function something {}');
      return expect(sut.transpile([invalidJavascriptFile])).rejectedWith(
        'Could not instrument "mutate.js" for code coverage. Inner error: SyntaxError: Unexpected token'
      );
    });
  });
});
