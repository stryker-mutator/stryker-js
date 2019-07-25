import { BaseContext, commonTokens, declareClassPlugin, declareFactoryPlugin, Injector, PluginKind, tokens } from '@stryker-mutator/api/plugin';

import MochaConfigEditor from './MochaConfigEditor';
import MochaOptionsLoader from './MochaOptionsLoader';
import MochaTestRunner from './MochaTestRunner';

export const strykerPlugins = [
  declareFactoryPlugin(PluginKind.ConfigEditor, 'mocha-runner', mochaConfigEditorFactory),
  declareClassPlugin(PluginKind.TestRunner, 'mocha', MochaTestRunner)
];

mochaConfigEditorFactory.inject = tokens(commonTokens.injector);
function mochaConfigEditorFactory(injector: Injector<BaseContext>): MochaConfigEditor {
  return injector
    .provideClass('loader', MochaOptionsLoader)
    .injectClass(MochaConfigEditor);
}
