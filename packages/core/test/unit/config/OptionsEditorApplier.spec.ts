import { PluginKind } from '@stryker-mutator/api/plugin';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import * as sinon from 'sinon';

import { OptionsEditorApplier } from '../../../src/config';
import { coreTokens } from '../../../src/di';
import { PluginCreator } from '../../../src/di/PluginCreator';

describe(OptionsEditorApplier.name, () => {
  let sut: OptionsEditorApplier;
  let configEditorPluginCreatorMock: sinon.SinonStubbedInstance<PluginCreator<PluginKind.ConfigEditor>>;
  let optionsEditorPluginCreatorMock: sinon.SinonStubbedInstance<PluginCreator<PluginKind.OptionsEditor>>;

  beforeEach(() => {
    configEditorPluginCreatorMock = sinon.createStubInstance(PluginCreator);
    optionsEditorPluginCreatorMock = sinon.createStubInstance(PluginCreator);
    sut = testInjector.injector
      .provideValue(coreTokens.pluginCreatorConfigEditor, (configEditorPluginCreatorMock as unknown) as PluginCreator<PluginKind.ConfigEditor>)
      .provideValue(coreTokens.pluginCreatorOptionsEditor, (optionsEditorPluginCreatorMock as unknown) as PluginCreator<PluginKind.OptionsEditor>)
      .injectClass(OptionsEditorApplier);
  });

  it('should apply all config editors', () => {
    // Arrange
    const options = factory.strykerOptions();
    const fooConfigEditor = factory.configEditor();
    const barConfigEditor = factory.configEditor();
    const bazOptionsEditor = factory.optionsEditor();
    const quxOptionsEditor = factory.optionsEditor();
    const configEditorPlugins = [{ name: 'fooConfigEditorPlugin' }, { name: 'barConfigEditorPlugin' }];
    const optionEditorPlugins = [{ name: 'bazOptionsEditorPlugin' }, { name: 'quxOptionsEditorPlugin' }];
    testInjector.pluginResolver.resolveAll
      .withArgs(PluginKind.OptionsEditor)
      .returns(optionEditorPlugins)
      .withArgs(PluginKind.ConfigEditor)
      .returns(configEditorPlugins);
    configEditorPluginCreatorMock.create
      .withArgs(configEditorPlugins[0].name)
      .returns(fooConfigEditor)
      .withArgs(configEditorPlugins[1].name)
      .returns(barConfigEditor);
    optionsEditorPluginCreatorMock.create
      .withArgs(optionEditorPlugins[0].name)
      .returns(bazOptionsEditor)
      .withArgs(optionEditorPlugins[1].name)
      .returns(quxOptionsEditor);

    // Act
    sut.edit(options);

    // Assert
    expect(fooConfigEditor.edit).calledWith(options);
    expect(barConfigEditor.edit).calledWith(options);
    expect(bazOptionsEditor.edit).calledWith(options);
    expect(quxOptionsEditor.edit).calledWith(options);
  });
});
