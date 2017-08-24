import { expect } from 'chai';
import SourceFile from '../../src/SourceFile';
import { textFile } from '../helpers/producers';


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
    sut = new SourceFile(textFile({ content }));
  });

  describe('getLocation', () => {
    it('should provide correct location when given range falls a line, 1-based', () => {
      const range: [number, number] = [7, 12];
      const expectedSubString = '34567';
      const loc = sut.getLocation(range);
      expect(content.substring(range[0], range[1])).eq(expectedSubString);
      expect(lines[loc.start.line - 1].substring(loc.start.column - 1, loc.end.column - 1)).eq(expectedSubString);
      expect(loc).deep.eq({ start: { line: 4, column: 3 }, end: { line: 4, column: 8 } });
    });

    it('should provide correct location falls on line starts, 1-based', () => {
      const range: [number, number] = [3, 5];
      const expectedSubString = '3\n';
      const loc = sut.getLocation(range);
      expect(content.substring(range[0], range[1])).eq(expectedSubString);
      expect(lines[loc.start.line - 1].substr(loc.start.column - 1) + '\n' + lines[loc.end.line - 1].substr(0, loc.end.column - 1)).eq(expectedSubString);
      expect(loc).deep.eq({ start: { line: 3, column: 1 }, end: { line: 4, column: 1 } });
    });

    it('should work for line 1', () => {
      sut = new SourceFile(textFile({ content: '1234567' }));
      expect(sut.getLocation([2, 4])).deep.eq({ start: { line: 1, column: 3 }, end: { line: 1, column: 5 }});
    });
  });
});