import { declareFactoryPlugin, PluginKind, BaseContext, tokens, commonTokens, Injector, declareClassPlugin } from 'stryker-api/plugin';

import MochaTestRunner from './MochaTestRunner';
import MochaConfigEditor from './MochaConfigEditor';
import MochaOptionsLoader from './MochaOptionsLoader';

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
