import { Config } from '@jest/types';
import { CoverageAnalysis, StrykerOptions } from '@stryker-mutator/api/core';
import { propertyPath } from '@stryker-mutator/util';

const JEST_CIRCUS_RUNNER = 'jest-circus/runner';

/**
 * Jest's defaults.
 * @see https://jestjs.io/docs/en/configuration
 */
const jestDefaults = Object.freeze({
  testRunner: 'jest-jasmine2',
  testEnvironment: 'jsdom',
});

const setupFilesForPerTestCoverageAnalysis: Record<string, string> = {
  'jest-jasmine2': require.resolve('./jasmine2-setup-coverage-analysis'),
};

const testEnvironmentOverrides: Record<string, string> = {
  node: require.resolve('./jest-environment-node'),
  jsdom: require.resolve('./jest-environment-jsdom'),
  'jsdom-sixteen': require.resolve('./jest-environment-jsdom-sixteen'),
};

function getName(requireId: string, optionalPrefix: string) {
  if (requireId.startsWith(optionalPrefix)) {
    return requireId.substr(optionalPrefix.length);
  } else {
    return requireId;
  }
}

export function withCoverageAnalysis(jestConfig: Config.InitialOptions, coverageAnalysis: CoverageAnalysis): Config.InitialOptions {
  // Override with Stryker specific test environment to capture coverage analysis
  if (coverageAnalysis === 'off') {
    return jestConfig;
  } else {
    const overrides: Config.InitialOptions = {};
    overrideEnvironment(jestConfig, overrides);
    if (coverageAnalysis === 'perTest') {
      setupFramework(jestConfig, overrides);
    }
    return { ...jestConfig, ...overrides };
  }
}

function setupFramework(jestConfig: Config.InitialOptions, overrides: Config.InitialOptions) {
  const setupFile = setupFilesForPerTestCoverageAnalysis[jestConfig.testRunner ?? jestDefaults.testRunner];
  if (setupFile) {
    overrides.setupFilesAfterEnv = [setupFile, ...(jestConfig.setupFilesAfterEnv ?? [])];
  } else if (jestConfig.testRunner !== JEST_CIRCUS_RUNNER) {
    // 'jest-circus/runner' is supported, via handleTestEvent, see https://jestjs.io/docs/en/configuration#testenvironment-string
    throw new Error(
      `The @stryker-mutator/jest-runner doesn't support ${propertyPath<StrykerOptions>(
        'coverageAnalysis'
      )} "perTest" with "jestConfig.testRunner": "${
        jestConfig.testRunner
      }". Please open an issue if you want support for this: https://github.com/stryker-mutator/stryker-js/issues`
    );
  }
}

function overrideEnvironment(jestConfig: Config.InitialOptions, overrides: Config.InitialOptions) {
  const jestEnvironment = getName(jestConfig.testEnvironment ?? jestDefaults.testEnvironment, 'jest-environment-');
  if (testEnvironmentOverrides[jestEnvironment]) {
    overrides.testEnvironment = testEnvironmentOverrides[jestEnvironment];
  }
}
