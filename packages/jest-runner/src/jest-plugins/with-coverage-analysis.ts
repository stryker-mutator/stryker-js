import path from 'path';
import { fileURLToPath, URL } from 'url';

import { Config } from '@jest/types';
import { CoverageAnalysis, StrykerOptions } from '@stryker-mutator/api/core';
import { propertyPath } from '@stryker-mutator/util';
import semver from 'semver';

import { jestWrapper } from '../utils/index.js';

import { state } from './cjs/messaging.js';

const jestEnvironmentGenericFileName = fileURLToPath(new URL('./cjs/jest-environment-generic.js', import.meta.url));

/**
 * Jest's defaults.
 * @see https://jestjs.io/docs/en/configuration
 */
function getJestDefaults() {
  // New defaults since 27: https://jestjs.io/blog/2021/05/25/jest-27
  if (semver.satisfies(jestWrapper.getVersion(), '>=27')) {
    return {
      testRunner: 'jest-circus/runner',
      testEnvironment: 'node',
    };
  } else {
    return {
      // the defaults before v27
      testRunner: 'jest-jasmine2',
      testEnvironment: 'jsdom',
    };
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

/**
 * Setup the test framework (aka "runner" in jest terms) for "perTest" coverage analysis.
 * Will use monkey patching for framework "jest-jasmine2", and will assume the test environment handles events when "jest-circus"
 */
function setupFramework(jestConfig: Config.InitialOptions, overrides: Config.InitialOptions) {
  const testRunner = jestConfig.testRunner ?? getJestDefaults().testRunner;
  if (testRunner === 'jest-jasmine2') {
    overrides.setupFilesAfterEnv = [
      path.resolve(path.dirname(fileURLToPath(import.meta.url)), './jasmine2-setup-coverage-analysis.js'),
      ...(jestConfig.setupFilesAfterEnv ?? []),
    ];
  } else if (!testRunner.includes('jest-circus')) {
    // 'jest-circus/runner' is supported, via handleTestEvent, see https://jestjs.io/docs/en/configuration#testenvironment-string
    // Use includes here, since "react-scripts" will specify the full path to `jest-circus`, see https://github.com/stryker-mutator/stryker-js/issues/2789
    throw new Error(
      `The @stryker-mutator/jest-runner doesn't support ${propertyPath<StrykerOptions>()(
        'coverageAnalysis'
      )} "perTest" with "jestConfig.testRunner": "${
        jestConfig.testRunner
      }". Please open an issue if you want support for this: https://github.com/stryker-mutator/stryker-js/issues`
    );
  }
}

export function overrideEnvironment(jestConfig: Config.InitialOptions, overrides: Config.InitialOptions): void {
  const originalJestEnvironment = jestConfig.testEnvironment ?? getJestDefaults().testEnvironment;
  state.jestEnvironment = nameEnvironment(originalJestEnvironment);
  overrides.testEnvironment = jestEnvironmentGenericFileName;
}

function nameEnvironment(shortName: string): string {
  return ['node', 'jsdom'].includes(shortName) ? `jest-environment-${shortName}` : shortName;
}
