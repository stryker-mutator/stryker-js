import { expect } from 'chai';
import JasmineTestFramework from '../../src/JasmineTestFramework';

describe('JasmineTestFramework', () => {
  let sut: JasmineTestFramework;
  beforeEach(() => sut = new JasmineTestFramework({ options: {} }));

  describe('beforeEach()', () => {
    it('should result in a specStarted reporter hook', () =>
      expect(sut.beforeEach('fragment')).to.contain('fragment').and.to.contain('specStarted: function () {'));
  });

  describe('afterEach()', () => {
    it('should result in an specDone reporter hook', () =>
      expect(sut.afterEach('fragment')).to.contain('fragment').and.to.contain('specDone: function () {'));
  });

  describe('filter()', () => {
    it('should result in a specFilter of jasmine it\'s', () =>
      expect(sut.filter([5, 8]))
        .to.contain('jasmine.getEnv().specFilter = function (spec)')
        .and.to.contain('if([5,8].indexOf(currentTestId) >= 0){'));
  });
});