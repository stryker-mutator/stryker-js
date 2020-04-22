import { expect } from 'chai';
import { normalizeWhitespaces } from '@stryker-mutator/util';

import MochaTestFramework from '../../src/MochaTestFramework';

describe('MochaTestFramework', () => {
  let sut: MochaTestFramework;
  beforeEach(() => (sut = new MochaTestFramework()));

  describe('beforeEach()', () => {
    it('should result in a beforeEach mocha hook', () => expect(sut.beforeEach('fragment')).to.contain('fragment').and.to.contain('beforeEach'));
  });

  describe('afterEach()', () => {
    it('should result in an afterEach mocha hook', () => expect(sut.afterEach('fragment')).to.contain('fragment').and.to.contain('afterEach'));
  });

  describe('filter()', () => {
    it("should result in a filtering of mocha it's", () => {
      expect(
        sut.filter([
          { id: 5, name: 'test five' },
          { id: 8, name: 'test eight' },
        ])
      )
        .to.contain('var realAddTest = Mocha.Suite.prototype.addTest;')
        .to.contain("var Mocha = window.Mocha || require('mocha');")
        .and.to.contain('selectedTestNames = ["test five","test eight"];')
        .and.to.contain('if(!selectedTestNames.length || selectedTestNames.indexOf(name) !== -1)')
        .and.to.contain('realAddTest.apply(this, arguments);');
    });
    it('should result in a filter reset when selecting no tests', () => {
      const actualFilter = normalizeWhitespaces(sut.filter([]));
      const expectedFilter = normalizeWhitespaces(`
        var Mocha = window.Mocha || require('mocha');
        var describe = Mocha.describe;
        if (window.____mochaAddTest) {
          Mocha.Suite.prototype.addTest = window.____mochaAddTest;
        }
      `);
      expect(actualFilter).eq(expectedFilter);
    });
  });
});
