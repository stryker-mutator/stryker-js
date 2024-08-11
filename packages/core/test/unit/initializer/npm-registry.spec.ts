import { getRegistry } from '../../../src/initializer/npm-registry.js';
import { expect } from 'chai';
import log4js from 'log4js';

const DEFAULT_REGISTRY = 'https://registry.npmjs.com';

describe('npm registry', () => {
  describe('get registry', () => {
    let oldNpmConfigRegistry: string | undefined;
    let oldNpmCommand: string | undefined;

    before(() => {
      oldNpmConfigRegistry = process.env.npm_config_registry;

      oldNpmCommand = process.env.npm_command;
    });

    after(() => {
      process.env.npm_config_registry = oldNpmConfigRegistry;

      process.env.npm_command = oldNpmCommand;
    });

    it('should return default repository when run with npm command with no custom repository', () => {
      process.env.npm_config_registry = '';

      process.env.npm_command = 'value';

      const registry = getRegistry(log4js.getLogger());

      expect(registry).to.equal(DEFAULT_REGISTRY);
    });

    it('should return default repository when run with npm command with custom repository', () => {
      process.env.npm_config_registry = 'foo';

      process.env.npm_command = 'value';

      const registry = getRegistry(log4js.getLogger());

      expect(registry).to.equal('foo');
    });
  });
});
