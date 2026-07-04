import { expect } from 'chai';

import { isSupportedNodeVersion } from '../../src/node-version.js';

describe('isSupportedNodeVersion', () => {
  const cases: Array<[string, boolean]> = [
    ['22.8.0', true], // exact minimum
    ['22.8.1', true], // newer patch
    ['22.9.0', true], // newer minor
    ['24.15.0', true], // newer major
    ['23.0.0', true], // newer major, lower minor than 8 (must still pass)
    ['22.7.9', false], // older minor
    ['22.0.0', false], // older minor
    ['21.99.99', false], // older major
  ];
  for (const [version, expected] of cases) {
    it(`${version} -> ${expected ? 'supported' : 'unsupported'}`, () => {
      expect(isSupportedNodeVersion(version)).eq(expected);
    });
  }
});
