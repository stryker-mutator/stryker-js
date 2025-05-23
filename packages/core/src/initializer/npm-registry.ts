import { execaCommandSync } from 'execa';
import { RestClient } from 'typed-rest-client';
import * as initializerTokens from './initializer-tokens.js';
import { coreTokens } from '../di/index.js';
import { errorToString } from '@stryker-mutator/util';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens } from '@stryker-mutator/api/plugin';

const DEFAULT_NPM_REGISTRY = 'https://registry.npmjs.com';

function getRegistry(
  logger: Logger,
  execaSync: typeof execaCommandSync,
): string {
  if (process.env.npm_config_registry) {
    return process.env.npm_config_registry;
  } else if (process.env.npm_command) {
    // if running inside npm and not having the registry than it's the default one
    return DEFAULT_NPM_REGISTRY;
  } else {
    // Using global as when trying to get the registry inside npm workspace it would fail
    try {
      const registry = execaSync('npm config get --global registry', {
        stdout: 'pipe',
        timeout: 20000,
      });

      return registry.stdout.trim();
    } catch (e) {
      logger.warn(
        'Could not run `npm config get --global registry` falling back to default npm registry.',
        errorToString(e),
      );

      return DEFAULT_NPM_REGISTRY;
    }
  }
}

getRegistry.inject = [commonTokens.logger, coreTokens.execaSync] as const;

function createNpmRegistryClient(npmRegistry: string): RestClient {
  return new RestClient('npm', npmRegistry);
}

createNpmRegistryClient.inject = [initializerTokens.npmRegistry] as const;

export { createNpmRegistryClient, getRegistry };
