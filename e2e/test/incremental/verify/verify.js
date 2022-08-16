import { promises as fsPromises } from 'fs';

import { Stryker } from '@stryker-mutator/core';
import { expect } from 'chai';
import { calculateMetrics } from 'mutation-testing-metrics';

import { CoverageAnalysisReporter } from './coverage-analysis-reporter.js';

const incrementalFile = new URL('../reports/stryker-incremental.json', import.meta.url);

describe('incremental', () => {
  /**
   * @type {import('@stryker-mutator/api/core').PartialStrykerOptions}
   */
  let strykerOptions;

  beforeEach(async () => {
    await fsPromises.rm(incrementalFile, { force: true });
    strykerOptions = { incremental: true, concurrency: 1 };
    await changeFiles('changed');
  });

  ['cucumber', 'jest'].forEach((testRunner) => {
    it(`should reuse expected mutant results for ${testRunner}`, async () => {
      // Arrange
      // strykerOptions.testRunner = testRunner;
      // const stryker = new Stryker(strykerOptions);
      // await stryker.runMutationTest();
      // await fsPromises.access(incrementalFile);
      // // Act
      // await stryker.runMutationTest();
      // expect();
    });
  });

  /**
   * @param {'changed' | 'original'} blueprint
   * @param location
   */
  async function changeFiles(blueprint, location = new URL('../', import.meta.url)) {
    const ext = `.${blueprint}`;
    const entries = await fsPromises.readdir(location, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name !== 'node_modules') {
        const entryLoc = new URL(`${entry.name}/`, location);
        await changeFiles(blueprint, entryLoc);
      }
      if (entry.isFile() && entry.name.endsWith(ext)) {
        const entryLoc = new URL(entry.name, location);
        const newUrl = new URL(entry.name.substring(0, entry.name.length - ext.length), location);
        await fsPromises.copyFile(entryLoc, newUrl);
      }
    }
  }
});
