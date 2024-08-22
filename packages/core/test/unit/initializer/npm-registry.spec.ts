import { getRegistry } from '../../../src/initializer/npm-registry.js';
import { expect } from 'chai';
import { testInjector } from '@stryker-mutator/test-helpers';
import sinon from 'sinon';
import { execaCommandSync } from 'execa';

const DEFAULT_REGISTRY = 'https://registry.npmjs.com';

describe('npm registry', () => {
  describe('get registry', () => {
    let oldNpmConfigRegistry: string | undefined;
    let oldNpmCommand: string | undefined;

    beforeEach(() => {
      oldNpmConfigRegistry = process.env.npm_config_registry;
      oldNpmCommand = process.env.npm_command;
    });

    afterEach(() => {
      process.env.npm_config_registry = oldNpmConfigRegistry;
      process.env.npm_command = oldNpmCommand;
    });

    it('should return default repository when run with npm command with no custom repository', () => {
      const execaCommandSyncMock = sinon.spy();

      process.env.npm_config_registry = '';
      process.env.npm_command = 'value';

      const registry = getRegistry(testInjector.logger, execaCommandSyncMock);

      expect(registry).to.equal(DEFAULT_REGISTRY);
      sinon.assert.callCount(execaCommandSyncMock, 0);
    });

    it('should return default repository when run with npm command with custom repository', () => {
      const execaCommandSyncMock = sinon.spy();
      process.env.npm_config_registry = 'foo';
      process.env.npm_command = 'value';

      const registry = getRegistry(testInjector.logger, execaCommandSyncMock);

      expect(registry).to.equal('foo');
      sinon.assert.callCount(execaCommandSyncMock, 0);
    });

    it('should return globally configured npm registry when run with node command', () => {
      const expectedRegistry = 'http://my.custom.npm.registry.stryker';
      const execaCommandSyncMock = sinon.spy((_command, _options) => ({ stdout: expectedRegistry }));
      process.env.npm_config_registry = '';
      process.env.npm_command = '';

      const registry = getRegistry(testInjector.logger, execaCommandSyncMock as unknown as typeof execaCommandSync);

      sinon.assert.calledOnceWithExactly(execaCommandSyncMock, 'npm config get --global registry', {
        stdout: 'pipe',
        timeout: 20000,
      });

      expect(registry).to.equal(expectedRegistry);
    });

    it('should return default repository and warn the user if run with node command and execa command failed', () => {
      const execaCommandSyncMock = sinon.spy((_command, _options) => {
        throw new Error();
      });

      process.env.npm_config_registry = '';
      process.env.npm_command = '';

      const registry = getRegistry(testInjector.logger, execaCommandSyncMock as unknown as typeof execaCommandSync);

      sinon.assert.calledOnceWithExactly(execaCommandSyncMock, 'npm config get --global registry', {
        stdout: 'pipe',
        timeout: 20000,
      });

      expect(registry).to.equal(DEFAULT_REGISTRY);
      sinon.assert.calledOnceWithMatch(
        testInjector.logger.warn,
        'Could not run `npm config get --global registry` falling back to default npm registry.',
      );
    });
  });
});
