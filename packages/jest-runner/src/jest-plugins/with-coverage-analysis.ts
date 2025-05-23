import path from 'path';
import { fileURLToPath, URL } from 'url';

import type { Config } from '@jest/types';
import { CoverageAnalysis, StrykerOptions } from '@stryker-mutator/api/core';
import { propertyPath } from '@stryker-mutator/util';
import semver from 'semver';

import { JestWrapper } from '../utils/jest-wrapper.js';

import { state } from './messaging.cjs';

const jestEnvironmentGenericFileName = fileURLToPath(
  new URL('./jest-environment-generic.cjs', import.meta.url),
);

/**
 * Jest's defaults.
 * @see https://jestjs.io/docs/en/configuration
 */
function getJestDefaults(jestWrapper: JestWrapper) {
  // New defaults since 27: https://jestjs.io/blog/2021/05/25/jest-27
  if (semver.satisfies(semver.coerce(jestWrapper.getVersion())!, '>=27')) {
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

export function withCoverageAnalysis(
  jestConfig: Config.InitialOptions,
  coverageAnalysis: CoverageAnalysis,
  jestWrapper: JestWrapper,
): Config.InitialOptions {
  // Override with Stryker specific test environment to capture coverage analysis
  if (coverageAnalysis === 'off') {
    return jestConfig;
  } else {
    const overrides: Config.InitialOptions = {};
    overrideEnvironment(jestConfig, overrides, jestWrapper);
    if (coverageAnalysis === 'perTest') {
      setupFramework(jestConfig, overrides, jestWrapper);
    }
    return { ...jestConfig, ...overrides };
  }
}

export function withHitLimit(
  jestConfig: Config.InitialOptions,
  hitLimit: number | undefined,
  jestWrapper: JestWrapper,
): Config.InitialOptions {
  // Override with Stryker specific test environment to capture coverage analysis
  if (typeof hitLimit === 'number') {
    const overrides: Config.InitialOptions = {};
    overrideEnvironment(jestConfig, overrides, jestWrapper);
    return { ...jestConfig, ...overrides };
  } else {
    return jestConfig;
  }
}

/**
 * Setup the test framework (aka "runner" in jest terms) for "perTest" coverage analysis.
 * Will use monkey patching for framework "jest-jasmine2", and will assume the test environment handles events when "jest-circus"
 */
function setupFramework(
  jestConfig: Config.InitialOptions,
  overrides: Config.InitialOptions,
  jestWrapper: JestWrapper,
) {
  const testRunner =
    jestConfig.testRunner ?? getJestDefaults(jestWrapper).testRunner;
  if (testRunner === 'jest-jasmine2') {
    overrides.setupFilesAfterEnv = [
      path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        './jasmine2-setup-coverage-analysis.cjs',
      ),
      ...(jestConfig.setupFilesAfterEnv ?? []),
    ];
  } else if (!testRunner.includes('jest-circus')) {
    // 'jest-circus/runner' is supported, via handleTestEvent, see https://jestjs.io/docs/en/configuration#testenvironment-string
    // Use includes here, since "react-scripts" will specify the full path to `jest-circus`, see https://github.com/stryker-mutator/stryker-js/issues/2789
    throw new Error(
      `The @stryker-mutator/jest-runner doesn't support ${propertyPath<StrykerOptions>()(
        'coverageAnalysis',
      )} "perTest" with "jestConfig.testRunner": "${
        jestConfig.testRunner
      }". Please open an issue if you want support for this: https://github.com/stryker-mutator/stryker-js/issues`,
    );
  }
}

function overrideEnvironment(
  jestConfig: Config.InitialOptions,
  overrides: Config.InitialOptions,
  jestWrapper: JestWrapper,
): void {
  const originalJestEnvironment =
    jestConfig.testEnvironment ?? getJestDefaults(jestWrapper).testEnvironment;
  state.jestEnvironment = nameEnvironment(originalJestEnvironment);
  overrides.testEnvironment = jestEnvironmentGenericFileName;
}

function nameEnvironment(shortName: string): string {
  return ['node', 'jsdom'].includes(shortName)
    ? `jest-environment-${shortName}`
    : shortName;
}
