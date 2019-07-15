import { ConfigEditorApplier } from '../../../src/config/ConfigEditorApplier';
import { TEST_INJECTOR, factory } from '@stryker-mutator/test-helpers';
import { PluginKind } from '@stryker-mutator/api/plugin';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { coreTokens } from '../../../src/di';
import { PluginCreator } from '../../../src/di/PluginCreator';

describe('ConfigEditorApplier', () => {
  let sut: ConfigEditorApplier;
  let pluginCreatorMock: sinon.SinonStubbedInstance<PluginCreator<PluginKind.ConfigEditor>>;

  beforeEach(() => {
    pluginCreatorMock = sinon.createStubInstance(PluginCreator);
    sut = TEST_INJECTOR.injector
      .provideValue(coreTokens.PluginCreatorConfigEditor, pluginCreatorMock as unknown as PluginCreator<PluginKind.ConfigEditor>)
      .injectClass(ConfigEditorApplier);
  });

  it('should apply all config editors', () => {
    const config = factory.CONFIG();
    const fooConfigEditor = factory.configEditor();
    const barConfigEditor = factory.configEditor();
    const configEditorPlugins = [{ name: 'fooConfigEditorPlugin' }, { name: 'barConfigEditorPlugin' }];
    TEST_INJECTOR.pluginResolver.resolveAll.returns(configEditorPlugins);
    pluginCreatorMock.create
      .withArgs(configEditorPlugins[0].name).returns(fooConfigEditor)
      .withArgs(configEditorPlugins[1].name).returns(barConfigEditor);
    sut.edit(config);
    expect(fooConfigEditor.edit).calledWith(config);
    expect(barConfigEditor.edit).calledWith(config);
  });

});
