import { promises as fsPromises } from 'fs';

import { Stryker } from '@stryker-mutator/core';
import { expect } from 'chai';

import { EventReporter } from './event-reporter.js';

const incrementalFile = new URL(
  '../reports/stryker-incremental.json',
  import.meta.url,
);
const jsonReportFile = new URL(
  '../reports/mutation/mutation.json',
  import.meta.url,
);

describe('no mutants to test', () => {
  /**
   * @type {import('@stryker-mutator/api/core').PartialStrykerOptions}
   */
  let strykerOptions;

  beforeEach(async () => {
    await fsPromises.rm(new URL('../reports', import.meta.url), {
      recursive: true,
      force: true,
    });
    EventReporter.events = [];
    process.exitCode = undefined;
    strykerOptions = {
      testRunner: 'mocha',
      concurrency: 1,
      coverageAnalysis: 'perTest',
      plugins: [
        './verify/event-reporter.js',
        import.meta.resolve('@stryker-mutator/mocha-runner'),
      ],
      reporters: ['event', 'json', 'clear-text'],
      thresholds: { high: 80, low: 60, break: 50 },
    };
  });

  afterEach(() => {
    process.exitCode = undefined;
  });

  it('should skip the dry run and still write the reports', async () => {
    const results = await new Stryker({
      ...strykerOptions,
      mutate: ['src/math.js:1-1'],
    }).runMutationTest();

    expect(results).deep.eq([]);
    expect(EventReporter.events).deep.eq([
      'onMutationTestingPlanReady',
      'onMutationTestReportReady',
      'wrapUp',
    ]);
    await fsPromises.access(jsonReportFile);
    expect(process.exitCode).not.eq(1);
  });

  it('should carry over the results of the incremental report', async () => {
    const firstResults = await new Stryker({
      ...strykerOptions,
      incremental: true,
      mutate: ['src/math.js'],
    }).runMutationTest();
    EventReporter.events = [];

    const secondResults = await new Stryker({
      ...strykerOptions,
      incremental: true,
      mutate: ['src/math.js:1-1'],
    }).runMutationTest();

    expect(firstResults).not.empty;
    expect(EventReporter.events).not.include('onDryRunCompleted');
    expect(secondResults.map(({ status }) => status)).deep.eq(
      firstResults.map(({ status }) => status),
    );
    const incrementalReport = JSON.parse(
      await fsPromises.readFile(incrementalFile, 'utf-8'),
    );
    expect(incrementalReport.files['src/math.js'].mutants).lengthOf(
      firstResults.length,
    );
  });

  it('should still run the dry run when "dryRunOnly" is enabled', async () => {
    await new Stryker({
      ...strykerOptions,
      dryRunOnly: true,
      mutate: ['src/math.js:1-1'],
    }).runMutationTest();

    expect(EventReporter.events).include('onDryRunCompleted');
  });
});
