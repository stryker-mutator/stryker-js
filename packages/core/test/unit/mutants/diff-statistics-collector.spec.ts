import { expect } from 'chai';
import chalk from 'chalk';

import { DiffChanges, DiffStatisticsCollector } from '../../../src/mutants/diff-statistics-collector.js';

describe(DiffStatisticsCollector.name, () => {
  it('should count changes', () => {
    const sut = new DiffStatisticsCollector();
    sut.count('src/foo.js', 'added', 40);
    sut.count('src/foo.js', 'added');
    sut.count('src/foo.js', 'added');
    sut.count('src/foo.js', 'removed');
    sut.count('src/foo.js', 'removed');
    sut.count('src/foo.js', 'removed', 40);
    const expected: DiffChanges = { added: 42, removed: 42 };
    expect(sut.changesByFile.get('src/foo.js')).deep.eq(expected);
  });

  it('should not count when the net-change is 0', () => {
    const sut = new DiffStatisticsCollector();
    sut.count('src/foo.js', 'added', 0);
    sut.count('src/foo.js', 'removed', 0);
    expect(sut.changesByFile.get('src/foo.js')).undefined;
  });

  it('should give a totals report', () => {
    const sut = new DiffStatisticsCollector();
    sut.count('src/foo.js', 'added', 40);
    sut.count('src/bar.js', 'added');
    sut.count('src/baz.js', 'removed');
    const expected = `${chalk.yellowBright(3)} files changed (${chalk.greenBright('+41')} ${chalk.redBright('-1')})`;
    const actual = sut.createTotalsReport();
    expect(actual).eq(expected);
  });

  it('should give a detailed report', () => {
    const sut = new DiffStatisticsCollector();
    sut.count('src/foo.js', 'added', 40);
    sut.count('src/bar.js', 'added');
    sut.count('src/baz.js', 'removed');
    const expected = [
      `src/foo.js ${chalk.greenBright('+40')} ${chalk.redBright('-0')}`,
      `src/bar.js ${chalk.greenBright('+1')} ${chalk.redBright('-0')}`,
      `src/baz.js ${chalk.greenBright('+0')} ${chalk.redBright('-1')}`,
    ];
    const actual = sut.createDetailedReport();
    expect(actual).deep.eq(expected);
  });

  it('should support empty reports', () => {
    const sut = new DiffStatisticsCollector();
    expect(sut.createDetailedReport()).lengthOf(0);
    expect(sut.createTotalsReport()).eq(`${chalk.yellowBright(0)} files changed (${chalk.greenBright('+0')} ${chalk.redBright('-0')})`);
  });
});
