import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath, URL } from 'url';

import { expect } from 'chai';

import { withCoverageAnalysis } from '../../../src/jest-plugins/with-coverage-analysis.js';
import { state } from '../../../src/jest-plugins/messaging.cjs';
import { JestWrapper } from '../../../src/utils/jest-wrapper.js';

describe(withCoverageAnalysis.name, () => {
  const genericEnvironment = fileURLToPath(
    new URL(
      '../../../src/jest-plugins/jest-environment-generic.cjs',
      import.meta.url,
    ),
  );

  function createJestWrapper(version = '30.4.2'): JestWrapper {
    return { getVersion: () => version } as unknown as JestWrapper;
  }

  it('should expand <rootDir> in testEnvironment before storing it for coverage analysis', () => {
    const rootDir = path.resolve('/tmp/project-root');

    const result = withCoverageAnalysis(
      { rootDir, testEnvironment: '<rootDir>/custom-env.js' },
      'perTest',
      createJestWrapper(),
    );

    expect(state.jestEnvironment).eq(path.join(rootDir, 'custom-env.js'));
    expect(result.testEnvironment).eq(genericEnvironment);
  });

  it('should honor a preset-provided testEnvironment when the raw config omits it', () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'jest-preset-env-'));
    fs.writeFileSync(
      path.join(rootDir, 'jest-preset.js'),
      'module.exports = { testEnvironment: "jsdom" };\n',
    );

    try {
      withCoverageAnalysis(
        { rootDir, preset: './jest-preset.js' },
        'all',
        createJestWrapper(),
      );

      expect(state.jestEnvironment).eq('jest-environment-jsdom');
    } finally {
      fs.rmSync(rootDir, { recursive: true, force: true });
    }
  });

  it('should expand <rootDir> in a preset-provided testEnvironment', () => {
    const rootDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'jest-preset-rootdir-'),
    );
    fs.writeFileSync(
      path.join(rootDir, 'jest-preset.js'),
      "module.exports = { testEnvironment: '<rootDir>/custom-env.js' };\n",
    );

    try {
      withCoverageAnalysis(
        { rootDir, preset: './jest-preset.js' },
        'perTest',
        createJestWrapper(),
      );

      expect(state.jestEnvironment).eq(path.join(rootDir, 'custom-env.js'));
    } finally {
      fs.rmSync(rootDir, { recursive: true, force: true });
    }
  });

  it('should still map the "node" shortcut after resolving', () => {
    withCoverageAnalysis(
      { testEnvironment: 'node' },
      'all',
      createJestWrapper(),
    );

    expect(state.jestEnvironment).eq('jest-environment-node');
  });

  it('should not override the environment when coverage analysis is off', () => {
    const result = withCoverageAnalysis(
      { testEnvironment: '<rootDir>/custom-env.js' },
      'off',
      createJestWrapper(),
    );

    expect(result.testEnvironment).eq('<rootDir>/custom-env.js');
    expect(state.jestEnvironment).eq('jest-environment-node');
  });
});
