import fs from 'fs';

import { expect } from 'chai';

import { execStryker, expectMetricsJsonToMatchSnapshot } from '../../../helpers.js';

describe('Ignore static e2e test', () => {
  beforeEach(async () => {
    await fs.promises.rm('reports', { recursive: true, force: true });
  });

  it('should work for mocha', async () => {
    const { exitCode } = execStryker('stryker run --testRunner mocha');
    expect(exitCode).eq(0);
    await expectMetricsJsonToMatchSnapshot();
  });
  it('should work for jasmine', async () => {
    const { exitCode } = execStryker('stryker run --testRunner jasmine');
    expect(exitCode).eq(0);
    await expectMetricsJsonToMatchSnapshot();
  });
  it('should work for karma', async () => {
    const { exitCode } = execStryker('stryker run --testRunner karma');
    expect(exitCode).eq(0);
    await expectMetricsJsonToMatchSnapshot();
  });
  it('should work for cucumber', async () => {
    const { exitCode } = execStryker('stryker run --testRunner cucumber');
    expect(exitCode).eq(0);
    await expectMetricsJsonToMatchSnapshot();
  });
  it('should work for jest', async () => {
    const { exitCode } = execStryker('stryker run --testRunner jest --tempDirName stryker-tmp');
    expect(exitCode).eq(0);
    await expectMetricsJsonToMatchSnapshot();
  });
});
