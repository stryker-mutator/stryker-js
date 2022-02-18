import path from 'path';
import { fileURLToPath } from 'url';

import { execaNode } from 'execa';
import { expect } from 'chai';

import { JasmineTestRunner } from '../../src/index.js';

describe(JasmineTestRunner.name, () => {
  it('should not leak memory when running multiple times (#2461)', async function () {
    const childProcess = await execaNode(path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'memory-leak.worker.js'), [], {
      stdio: 'pipe',
      nodeOptions: ['--max-old-space-size=32', '--max-semi-space-size=1'],
    });
    expect(childProcess.exitCode).eq(0);
    expect(childProcess.stdout).contains('Iterator count 1');
  });
});
