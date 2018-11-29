import { expect } from 'chai';
import { Config } from '../../../config';

describe('Config', () => {

  let sut: Config;
  const defaultThresholds = Object.freeze({ high: 80, low: 60, break: null });

  beforeEach(() => sut = new Config());

  describe('defaults', () => {
    it('should set default thresholds as expected', () => {
      expect(sut.thresholds).deep.eq(defaultThresholds);
    });
  });

  describe('set', () => {

    it('should override values', () => {
      const expectedFiles = ['a file'];
      sut.set({ files: expectedFiles });
      expect(sut.files).eq(expectedFiles);
    });

    it('should override thresholds when assigned', () => {
      sut.set({ thresholds: {} });
      expect(sut.thresholds).deep.eq({});
    });

    it('should override testRunner when assigned', () => {
      sut.set({ testRunner: { name: 'fakeTestRunner' } });
      expect(sut.testRunner).deep.eq({ name: 'fakeTestRunner' });
    });

    it('should never clear thresholds', () => {
      sut.set({ thresholds: undefined });
      expect(sut.thresholds).not.be.undefined;
    });
  });
});
