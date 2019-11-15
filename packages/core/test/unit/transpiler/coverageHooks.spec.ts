import { testFramework } from '@stryker-mutator/test-helpers/src/factory';
import { expect } from 'chai';

import * as coverageHooks from '../../../src/transpiler/coverageHooks';

describe('coveragePerTestHooks', () => {
  it('should use the coverage variable "__strykerCoverageCurrentTest__"', () => {
    const actual = coverageHooks.coveragePerTestHooks(testFramework());
    expect(actual).to.contain('__strykerCoverageCurrentTest__');
  });

  it('should use beforeEach and afterEach (test framework hooks)', () => {
    const actual = coverageHooks.coveragePerTestHooks(testFramework());
    expect(actual).to.contain('beforeEach()');
    expect(actual).to.contain('afterEach()');
  });

  it('should wrap all in a closure', () => {
    const actual = coverageHooks.coveragePerTestHooks(testFramework());
    expect(actual).to.contain('(function (window) {');
    expect(actual).to.contain("})((Function('return this'))());");
  });
});
