import { expect } from 'chai';
import { EOL } from 'os';
import StringBuilder from '../../../src/utils/StringBuilder';

describe(StringBuilder.name, () => {

  it('should append strings with new lines when `toString()` is called', () => {
    const sut = new StringBuilder();
    sut.append('1');
    sut.append('2');
    sut.append('3');
    expect(sut.toString()).eq(`1${EOL}2${EOL}3`);
  });

  const DEFAULT_MAX_CHARACTERS = 2048;
  it(`should append a to maximum of ${DEFAULT_MAX_CHARACTERS} characters by default`, () => {
    const sut = new StringBuilder();
    for (let i = 0; i < DEFAULT_MAX_CHARACTERS; i++) {
      sut.append('.');
    }
    sut.append('expected');
    const result = sut.toString();
    expect(result.replace(new RegExp(EOL, 'g'), '')).lengthOf(DEFAULT_MAX_CHARACTERS);
    expect(result.endsWith(`.${EOL}.${EOL}.${EOL}expected`)).ok;
  });

  it('should not split the last string, even if it exceeds the max characters', () => {
    const input = new Array(DEFAULT_MAX_CHARACTERS + 1).fill('.').join('');
    const sut = new StringBuilder();
    sut.append(input);
    expect(sut.toString()).eq(input);
  });
});