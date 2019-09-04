import { File } from '@stryker-mutator/api/core';
import { expect } from 'chai';
import SourceFile from '../../src/SourceFile';

const content = `
2
3
4234567890
5
6
`.replace(/\r\n/g, '\n'); // Normalize newlines for reliable tests
const lines = content.split('\n');

describe('SourceFile', () => {

  let sut: SourceFile;

  beforeEach(() => {
    sut = new SourceFile(new File('', content));
  });

  describe('getLocation', () => {
    it('should provide correct location when given range falls a line, zero-based', () => {
      const range: [number, number] = [7, 12];
      const expectedSubString = '34567';
      const loc = sut.getLocation(range);
      expect(content.substring(range[0], range[1])).eq(expectedSubString);
      expect(lines[loc.start.line].substring(loc.start.column, loc.end.column)).eq(expectedSubString);
      expect(loc).deep.eq({ start: { line: 3, column: 2 }, end: { line: 3, column: 7 } });
    });

    it('should provide correct location falls on line starts, zero-based', () => {
      const range: [number, number] = [3, 5];
      const expectedSubString = '3\n';
      const loc = sut.getLocation(range);
      expect(content.substring(range[0], range[1])).eq(expectedSubString);
      expect(lines[loc.start.line].substr(loc.start.column) + '\n' + lines[loc.end.line].substr(0, loc.end.column)).eq(expectedSubString);
      expect(loc).deep.eq({ start: { line: 2, column: 0 }, end: { line: 3, column: 0 } });
    });

    it('should work for line 0', () => {
      sut = new SourceFile(new File('', '1234567'));
      expect(sut.getLocation([2, 4])).deep.eq({ start: { line: 0, column: 2 }, end: { line: 0, column: 4 }});
    });
  });
});
