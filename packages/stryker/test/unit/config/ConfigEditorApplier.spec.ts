import { ConfigEditorApplier } from '../../../src/config/ConfigEditorApplier';
import { testInjector, factory } from '@stryker-mutator/test-helpers';
import { PluginKind } from 'stryker-api/plugin';
import { ConfigEditor } from 'stryker-api/config';
import * as sinon from 'sinon';
import { expect } from 'chai';

describe('ConfigEditorApplier', () => {
  let sut: ConfigEditorApplier;

  beforeEach(() => {
    sut = testInjector.injector.injectClass(ConfigEditorApplier);
  });

  it('should apply all config editors', () => {
    const config = factory.config();
    const fooConfigEditorPlugin = mockConfigEditorPlugin('foo-editor');
    const barConfigEditorPlugin = mockConfigEditorPlugin('bar-editor');
    testInjector.pluginResolver.resolveAll.returns([fooConfigEditorPlugin, barConfigEditorPlugin]);
    sut.edit(config);
    expect(fooConfigEditorPlugin.configEditorStub.edit).calledWith(config);
    expect(barConfigEditorPlugin.configEditorStub.edit).calledWith(config);
  });

  interface MockedConfigEditorPlugin {
    kind: PluginKind.ConfigEditor;
    factory: sinon.SinonStub;
    name: string;
    configEditorStub: sinon.SinonStubbedInstance<ConfigEditor>;
  }

  function mockConfigEditorPlugin(name: string): MockedConfigEditorPlugin {
    const configEditorPlugin: MockedConfigEditorPlugin = {
      configEditorStub: factory.configEditor(),
      factory: sinon.stub(),
      kind: PluginKind.ConfigEditor,
      name
    };
    configEditorPlugin.factory.returns(configEditorPlugin.configEditorStub);
    return configEditorPlugin;
  }

});
