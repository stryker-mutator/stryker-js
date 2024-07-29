import { testInjector } from '@stryker-mutator/test-helpers';
import { PluginKind } from '@stryker-mutator/api/plugin';

import { expect } from 'chai';

import { PluginLoader } from '../../../src/di/plugin-loader.js';
import { PluginCreator } from '../../../src/di/plugin-creator.js';
import { coreTokens } from '../../../src/di/index.js';

describe('Plugins integration', () => {
  describe('local plugins', () => {
    let pluginCreator: PluginCreator;

    beforeEach(async () => {
      const loader = testInjector.injector.injectClass(PluginLoader);
      const plugins = await loader.load(['./testResources/plugins/custom-plugins.js']);
      pluginCreator = testInjector.injector.provideValue(coreTokens.pluginsByKind, plugins.pluginsByKind).injectClass(PluginCreator);
    });

    it('should be able to load a "ValuePlugin"', () => {
      const plugin = pluginCreator.create(PluginKind.Ignore, 'console.debug');
      expect(plugin).ok;
      expect(plugin.shouldIgnore).a('function');
    });

    it('should be able to load a "FactoryPlugin"', () => {
      const plugin = pluginCreator.create(PluginKind.TestRunner, 'lazy');
      expect(plugin).ok;
      expect(plugin.capabilities).a('function');
    });

    it('should be able to load a "ClassPlugin"', () => {
      const plugin = pluginCreator.create(PluginKind.Reporter, 'console');
      expect(plugin).ok;
      expect(plugin.onMutationTestReportReady).a('function');
    });
  });
});
