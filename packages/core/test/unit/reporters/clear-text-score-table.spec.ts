import os from 'os';

import chalk from 'chalk';
import { expect } from 'chai';
import { testInjector, factory } from '@stryker-mutator/test-helpers';
import { MetricsResult } from 'mutation-testing-metrics';

import { ClearTextScoreTable } from '../../../src/reporters/clear-text-score-table.js';
import { stringWidth } from '../../../src/utils/string-utils.js';

describe(ClearTextScoreTable.name, () => {
  describe('draw', () => {
    it('should report the clear text table with correct values', () => {
      const metricsResult: MetricsResult = new MetricsResult(
        'root',
        [
          new MetricsResult(
            'child1',
            [new MetricsResult('some/test/for/a/deep/file.js', [], factory.metrics({ mutationScore: 59.99 }))],
            factory.metrics({ mutationScore: 60 }),
          ),
        ],
        factory.metrics({
          compileErrors: 7,
          killed: 1,
          mutationScore: 80,
          noCoverage: 4,
          runtimeErrors: 4,
          survived: 3,
          timeout: 2,
        }),
      );
      const sut = new ClearTextScoreTable(metricsResult, testInjector.options);

      const table = sut.draw();
      const rows = table.split(os.EOL);

      expect(rows).to.deep.eq([
        '-------------------------------|---------|----------|-----------|------------|----------|----------|',
        'File                           | % score | # killed | # timeout | # survived | # no cov | # errors |',
        '-------------------------------|---------|----------|-----------|------------|----------|----------|',
        `All files                      |${chalk.green('   80.00 ')}|        1 |         2 |          3 |        4 |       11 |`,
        ` child1                        |${chalk.yellow('   60.00 ')}|        0 |         0 |          0 |        0 |        0 |`,
        `  some/test/for/a/deep/file.js |${chalk.red('   59.99 ')}|        0 |         0 |          0 |        0 |        0 |`,
        '-------------------------------|---------|----------|-----------|------------|----------|----------|',
      ]);
    });

    it('should grow columns widths based on value size', () => {
      const metricsResult: MetricsResult = new MetricsResult(
        'root',
        [],
        factory.metrics({
          killed: 1000000000,
        }),
      );
      const sut = new ClearTextScoreTable(metricsResult, testInjector.options);

      const table = sut.draw();
      const rows = table.split(os.EOL);

      const killedColumnValues = rows.flatMap((row) => row.split('|').filter((_, i) => i === 2));
      killedColumnValues.forEach((val) => expect(stringWidth(val)).to.eq(12));
      expect(killedColumnValues[3]).to.eq(' 1000000000 ');
    });

    it('should color scores < low threshold in red, < high threshold in yellow and > high threshold in green', () => {
      const { options } = testInjector;
      options.thresholds = { high: 60, low: 50, break: 0 };
      const input: MetricsResult = factory.metricsResult({
        childResults: [
          factory.metricsResult({ metrics: factory.metrics({ mutationScore: 60.0 }) }),
          factory.metricsResult({ metrics: factory.metrics({ mutationScore: 59.99 }) }),
          factory.metricsResult({ metrics: factory.metrics({ mutationScore: 50.01 }) }),
          factory.metricsResult({ metrics: factory.metrics({ mutationScore: 50.0 }) }),
          factory.metricsResult({ metrics: factory.metrics({ mutationScore: 49.99 }) }),
        ],
        metrics: factory.metrics({ mutationScore: 60.01 }),
      });
      const sut = new ClearTextScoreTable(input, options);

      const table = sut.draw();

      expect(table).contains(chalk.red('   49.99 '));
      expect(table).contains(chalk.yellow('   50.00 '));
      expect(table).contains(chalk.yellow('   50.01 '));
      expect(table).contains(chalk.yellow('   59.99 '));
      expect(table).contains(chalk.green('   60.00 '));
      expect(table).contains(chalk.green('   60.01 '));
    });

    it('should color score in red and green if low equals high thresholds', () => {
      const { options } = testInjector;
      options.thresholds = { high: 60, low: 50, break: 0 };
      const input: MetricsResult = factory.metricsResult({
        childResults: [
          factory.metricsResult({ metrics: factory.metrics({ mutationScore: 50.0 }) }),
          factory.metricsResult({ metrics: factory.metrics({ mutationScore: 49.99 }) }),
        ],
        metrics: factory.metrics({ mutationScore: 50.01 }),
      });
      const sut = new ClearTextScoreTable(input, options);

      const table = sut.draw();

      expect(table).contains(chalk.red('   49.99 '));
      expect(table).contains(chalk.green('   50.00 '));
      expect(table).contains(chalk.green('   50.01 '));
    });
  });
});
