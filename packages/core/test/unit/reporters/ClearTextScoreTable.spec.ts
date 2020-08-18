import os from 'os';

import { MutationScoreThresholds } from '@stryker-mutator/api/core';
import { testInjector } from '@stryker-mutator/test-helpers';
import { metrics, metricsResult } from '@stryker-mutator/test-helpers/src/factory';
import { expect } from 'chai';
import { MetricsResult } from 'mutation-testing-metrics';

import chalk from 'chalk';
import flatMap from 'lodash.flatmap';

import { ClearTextScoreTable } from '../../../src/reporters/ClearTextScoreTable';

describe(ClearTextScoreTable.name, () => {
  describe('draw', () => {
    it('should report the clear text table with correct values', () => {
      const metricsResult: MetricsResult = {
        childResults: [
          {
            childResults: [
              {
                childResults: [],
                metrics: metrics({ mutationScore: 59.99 }),
                name: 'some/test/for/a/deep/file.js',
              },
            ],
            metrics: metrics({ mutationScore: 60 }),
            name: 'child1',
          },
        ],
        metrics: metrics({
          compileErrors: 7,
          killed: 1,
          mutationScore: 80,
          noCoverage: 4,
          runtimeErrors: 4,
          survived: 3,
          timeout: 2,
        }),
        name: 'root',
      };
      const sut = new ClearTextScoreTable(metricsResult, testInjector.options.thresholds);

      const table = sut.draw();
      const rows = table.split(os.EOL);

      expect(rows).to.deep.eq([
        '-------------------------------|---------|----------|-----------|------------|----------|---------|',
        'File                           | % score | # killed | # timeout | # survived | # no cov | # error |',
        '-------------------------------|---------|----------|-----------|------------|----------|---------|',
        `All files                      |${chalk.green('   80.00 ')}|        1 |         2 |          3 |        4 |      11 |`,
        ` child1                        |${chalk.yellow('   60.00 ')}|        0 |         0 |          0 |        0 |       0 |`,
        `  some/test/for/a/deep/file.js |${chalk.red('   59.99 ')}|        0 |         0 |          0 |        0 |       0 |`,
        '-------------------------------|---------|----------|-----------|------------|----------|---------|',
      ]);
    });

    it('should grow columns widths based on value size', () => {
      const metricsResult: MetricsResult = {
        childResults: [],
        metrics: metrics({
          killed: 1000000000,
        }),
        name: 'root',
      };
      const sut = new ClearTextScoreTable(metricsResult, testInjector.options.thresholds);

      const table = sut.draw();
      const rows = table.split(os.EOL);

      const killedColumnValues = flatMap(rows, (row) => row.split('|').filter((_, i) => i === 2));
      killedColumnValues.forEach((val) => expect(val).to.have.lengthOf(12));
      expect(killedColumnValues[3]).to.eq(' 1000000000 ');
    });

    it('should color scores < low threshold in red, < high threshold in yellow and > high threshold in green', () => {
      const thresholds: MutationScoreThresholds = { high: 60, low: 50, break: 0 };
      const input: MetricsResult = metricsResult({
        childResults: [
          metricsResult({ metrics: metrics({ mutationScore: 60.0 }) }),
          metricsResult({ metrics: metrics({ mutationScore: 59.99 }) }),
          metricsResult({ metrics: metrics({ mutationScore: 50.01 }) }),
          metricsResult({ metrics: metrics({ mutationScore: 50.0 }) }),
          metricsResult({ metrics: metrics({ mutationScore: 49.99 }) }),
        ],
        metrics: metrics({ mutationScore: 60.01 }),
      });
      const sut = new ClearTextScoreTable(input, thresholds);

      const table = sut.draw();

      expect(table).contains(chalk.red('   49.99 '));
      expect(table).contains(chalk.yellow('   50.00 '));
      expect(table).contains(chalk.yellow('   50.01 '));
      expect(table).contains(chalk.yellow('   59.99 '));
      expect(table).contains(chalk.green('   60.00 '));
      expect(table).contains(chalk.green('   60.01 '));
    });

    it('should color score in red and green if low equals high thresholds', () => {
      const thresholds: MutationScoreThresholds = { high: 50, low: 50, break: 0 };
      const input: MetricsResult = metricsResult({
        childResults: [metricsResult({ metrics: metrics({ mutationScore: 50.0 }) }), metricsResult({ metrics: metrics({ mutationScore: 49.99 }) })],
        metrics: metrics({ mutationScore: 50.01 }),
      });
      const sut = new ClearTextScoreTable(input, thresholds);

      const table = sut.draw();

      expect(table).contains(chalk.red('   49.99 '));
      expect(table).contains(chalk.green('   50.00 '));
      expect(table).contains(chalk.green('   50.01 '));
    });
  });
});
