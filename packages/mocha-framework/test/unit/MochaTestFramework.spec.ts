import { expect } from 'chai';

import MochaTestFramework from '../../src/MochaTestFramework';

describe('MochaTestFramework', () => {
  let sut: MochaTestFramework;
  beforeEach(() => (sut = new MochaTestFramework()));

  describe('beforeEach()', () => {
    it('should result in a beforeEach mocha hook', () =>
      expect(sut.beforeEach('fragment'))
        .to.contain('fragment')
        .and.to.contain('beforeEach'));
  });

  describe('afterEach()', () => {
    it('should result in an afterEach mocha hook', () =>
      expect(sut.afterEach('fragment'))
        .to.contain('fragment')
        .and.to.contain('afterEach'));
  });

  describe('filter()', () => {
    it("should result in a filtering of mocha it's", () => {
      expect(sut.filter([{ id: 5, name: 'test five' }, { id: 8, name: 'test eight' }]))
        .to.contain('var realAddTest = Mocha.Suite.prototype.addTest;')
        .and.to.contain('selectedTestNames = ["test five","test eight"];')
        .and.to.contain('if(selectedTestNames.indexOf(name) !== -1)')
        .and.to.contain('realAddTest.apply(this, arguments);');
    });
  });
});
