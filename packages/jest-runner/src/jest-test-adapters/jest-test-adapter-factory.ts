import { Logger } from '@stryker-mutator/api/logging';
import { StrykerOptions } from '@stryker-mutator/api/core';
import { BaseContext, commonTokens, Injector, tokens } from '@stryker-mutator/api/plugin';
import semver from 'semver';

import { jestVersion } from '../plugin-tokens';

import { JestLessThan25TestAdapter } from './jest-less-than-25-adapter';
import { JestGreaterThan25TestAdapter } from './jest-greater-than-25-adapter';

export function jestTestAdapterFactory(
  log: Logger,
  jest: string,
  options: StrykerOptions,
  injector: Injector<BaseContext>
): JestGreaterThan25TestAdapter | JestLessThan25TestAdapter {
  log.debug('Detected Jest version %s', jest);
  guardJestVersion(jest, options, log);

  if (semver.satisfies(jest, '<25.0.0')) {
    return injector.injectClass(JestLessThan25TestAdapter);
  } else {
    return injector.injectClass(JestGreaterThan25TestAdapter);
  }
}
jestTestAdapterFactory.inject = tokens(commonTokens.logger, jestVersion, commonTokens.options, commonTokens.injector);

function guardJestVersion(jest: string, options: StrykerOptions, log: Logger) {
  if (semver.satisfies(jest, '<22.0.0')) {
    throw new Error(`You need Jest version >= 22.0.0 to use the @stryker-mutator/jest-runner plugin, found ${jest}`);
  } else if (semver.satisfies(jest, '<24')) {
    if (options.coverageAnalysis !== 'off') {
      throw new Error(
        `You need Jest version >= 24.0.0 to use the @stryker-mutator/jest-runner with "coverageAnalysis": "${options.coverageAnalysis}", you're currently using version 23.0.0. Please upgrade your jest version, or set "coverageAnalysis": "off".`
      );
    }
    log.warn(
      '[DEPRECATED] Support for Jest version < 24 is deprecated and will be removed in the next major version of Stryker, please upgrade your jest version (your current version is %s).',
      jest
    );
  }
}
