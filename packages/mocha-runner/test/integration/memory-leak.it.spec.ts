import path = require('path');

import execa = require('execa');

import { expect } from 'chai';

import { MochaTestRunner } from '../../src';

describe(MochaTestRunner.name, () => {
  it('should not leak memory when running multiple times (#2461)', async () => {
    const childProcess = await execa.node(path.resolve(__dirname, 'memory-leak.worker.js'), [], {
      stdio: 'pipe',
      nodeOptions: ['--max-old-space-size=32', '--max-semi-space-size=1'],
    });
    expect(childProcess.exitCode).eq(0);
    expect(childProcess.stdout).contains('Iterator count 1');
  });
});
