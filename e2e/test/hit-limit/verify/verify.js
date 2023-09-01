import { expect } from 'chai';
import { Stryker } from '@stryker-mutator/core';
import { MutantStatus } from 'mutation-testing-report-schema/api';

describe('Limit counter', () => {
  /**
   * @param {string} runner
   * @param {boolean} [only]
   */
  function itShouldLimitInfiniteLoops(runner, only) {
    (only ? it.only : it)(`should limit infinite loops in the ${runner}-runner`, async () => {
      const stryker = new Stryker({ testRunner: runner });
      const results = await stryker.runMutationTest();
      const timeoutResults = results.filter((res) => res.status === MutantStatus.Timeout);
      expect(timeoutResults).lengthOf(3);
      timeoutResults.forEach((result) => expect(result.statusReason).eq('Hit limit reached (501/500)'));
    });
  }

  itShouldLimitInfiniteLoops('karma');
  itShouldLimitInfiniteLoops('mocha');
  itShouldLimitInfiniteLoops('jasmine');
  itShouldLimitInfiniteLoops('cucumber');
  itShouldLimitInfiniteLoops('jest');
  itShouldLimitInfiniteLoops('tap');
  itShouldLimitInfiniteLoops('vitest');
});
