import { expect } from 'chai';
import { PassThrough } from 'stream';
import { readable, streamToString } from '../../helpers/streamHelpers';
import { TestFramework } from 'stryker-api/test_framework';
import CoverageInstrumenter from '../../../src/coverage/CoverageInstrumenter';
import CoverageInstrumenterStream from '../../../src/coverage/CoverageInstrumenterStream';

describe('CoverageInstrumenter', () => {
  let sut: CoverageInstrumenter;
  let testFramework: TestFramework;
  const streamToFile = (path: string, mutated: boolean, content: string): Promise<string> => {
    const stream = sut.instrumenterStreamForFile({ path, mutated, included: true });
    const input = readable();
    input.push(content);
    input.push(null);
    return streamToString(input.pipe(stream));
  };

  beforeEach(() => {
    testFramework = {
      beforeEach: function (codeFragment: string): string {
        return `beforeEach() { ${codeFragment} }`;
      },
      afterEach: function (codeFragment: string): string {
        return `afterEach() { ${codeFragment} }`;
      },
      filter: function (testIds: number[]): string {
        return `filter(${JSON.stringify(testIds)})`;
      }
    };
  });

  describe('with coverageAnalysis "perTest"', () => {

    beforeEach(() => {
      sut = new CoverageInstrumenter('perTest', testFramework);
    });

    describe('when hooksForTestRun()', () => {
      it('should return the perTest hooks', () => {
        const actual = sut.hooksForTestRun();
        expect(actual).to.have.length.greaterThan(30);
        expect(actual).to.contain('beforeEach()');
        expect(actual).to.contain('afterEach()');
      });
    });

    describe('when instrumenterStreamForFile()', () => {

      it('should retrieve an intrumenter stream for mutated files', () => {
        const actual = sut.instrumenterStreamForFile({ path: '', mutated: true, included: true });
        expect(actual).to.be.an.instanceof(CoverageInstrumenterStream);
        if (actual instanceof CoverageInstrumenterStream) {
          expect(actual.coverageVariable).to.be.eq('__strykerCoverageCurrentTest__');
        }
      });

      it('should retrieve a PassThrough stream for non-mutated files', () =>
        expect(sut.instrumenterStreamForFile({ path: '', mutated: false, included: true })).to.be.an.instanceof(PassThrough));
    });
  });

  describe('with coverageAnalysis "off"', () => {

    beforeEach(() => {
      sut = new CoverageInstrumenter('off', testFramework);
    });

    describe('when hooksForTestRun()', () => {
      it('should return the empty string', () => expect(sut.hooksForTestRun()).to.have.length(0));
    });

    describe('when instrumenterStreamForFile()', () => {
      it('should retrieve a PassThrough stream for mutated files', () =>
        expect(sut.instrumenterStreamForFile({ path: '', mutated: true, included: true })).to.be.an.instanceof(PassThrough));
    });

    describe('retrieveStatementMapsPerFile() with 2 streams', () => {

      beforeEach(() => Promise.all([
        streamToFile('1', true, 'function(){}'),
        streamToFile('3', false, 'function(){}')
      ]));

      it('should retrieve 0 statement maps', () => {
        const actual = sut.retrieveStatementMapsPerFile();
        expect(Object.keys(actual)).to.have.lengthOf(0);
      });
    });
  });

  describe('with coverageAnalysis "all"', () => {

    beforeEach(() => {
      sut = new CoverageInstrumenter('all', testFramework);
    });

    describe('when hooksForTestRun()', () => {
      it('should return the empty string', () => expect(sut.hooksForTestRun()).to.have.length(0));
    });

    describe('when instrumenterStreamForFile()', () => {
      it('should retrieve a CoverageInstrumenterStream stream for mutated files', () => {
        const actual = sut.instrumenterStreamForFile({ path: '', mutated: true, included: true });
        expect(actual).to.be.an.instanceof(CoverageInstrumenterStream);
        if (actual instanceof CoverageInstrumenterStream) {
          expect(actual.coverageVariable).to.be.eq('__coverage__');
        }
      });
    });

    describe('retrieveStatementMapsPerFile() with 2 streams', () => {

      beforeEach(() => Promise.all([
        streamToFile('1', true, 'function a (){}'),
        streamToFile('2', true, 'function b (){}'),
        streamToFile('3', false, 'function c (){}')
      ]));

      it('should retrieve 2 statement maps', () => {
        const actual = sut.retrieveStatementMapsPerFile();
        expect(Object.keys(actual)).to.have.lengthOf(2);
        expect(actual['1']).to.be.ok;
        expect(actual['2']).to.be.ok;
      });
    });
  });
});