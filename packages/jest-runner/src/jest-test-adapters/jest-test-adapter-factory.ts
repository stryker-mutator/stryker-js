import { Logger } from '@stryker-mutator/api/logging';
import { StrykerOptions } from '@stryker-mutator/api/core';
import { commonTokens, Injector, tokens } from '@stryker-mutator/api/plugin';
import semver, { SemVer } from 'semver';

import { JestPluginContext, pluginTokens } from '../plugin-di.js';
import { JestWrapper } from '../utils/jest-wrapper.js';
import { JestTestAdapter } from './jest-test-adapter.js';

interface CoercedVersion {
  version: SemVer;
  raw: string;
}

function coerceVersion(version: string): CoercedVersion {
  return { version: semver.coerce(version)!, raw: version };
}

export function jestTestAdapterFactory(
  log: Logger,
  jestWrapper: JestWrapper,
  options: StrykerOptions,
  injector: Injector<JestPluginContext>,
): JestTestAdapter {
  const coercedVersion = coerceVersion(jestWrapper.getVersion());
  log.debug('Detected Jest version %s', coercedVersion.raw);
  guardJestVersion(coercedVersion, options, log);

  return injector.injectClass(JestTestAdapter);
}
jestTestAdapterFactory.inject = tokens(
  commonTokens.logger,
  pluginTokens.jestWrapper,
  commonTokens.options,
  commonTokens.injector,
);

function guardJestVersion(
  { version, raw }: CoercedVersion,
  options: StrykerOptions,
  log: Logger,
) {
  if (semver.satisfies(version, '<22.0.0')) {
    throw new Error(
      `You need Jest version >= 22.0.0 to use the @stryker-mutator/jest-runner plugin, found ${raw}`,
    );
  } else if (semver.satisfies(version, '<24')) {
    if (options.coverageAnalysis !== 'off') {
      throw new Error(
        `You need Jest version >= 24.0.0 to use the @stryker-mutator/jest-runner with "coverageAnalysis": "${options.coverageAnalysis}", you're currently using version 23.0.0. Please upgrade your jest version, or set "coverageAnalysis": "off".`,
      );
    }
    log.warn(
      '[DEPRECATED] Support for Jest version < 24 is deprecated and will be removed in the next major version of Stryker, please upgrade your jest version (your current version is %s).',
      raw,
    );
  }
}
