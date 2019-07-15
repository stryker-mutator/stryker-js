import { declareFactoryPlugin, PluginKind, BaseContext, tokens, COMMON_TOKENS, Injector, declareClassPlugin } from '@stryker-mutator/api/plugin';

import MochaTestRunner from './MochaTestRunner';
import MochaConfigEditor from './MochaConfigEditor';
import MochaOptionsLoader from './MochaOptionsLoader';

export const STRYKER_PLUGINS = [
  declareFactoryPlugin(PluginKind.ConfigEditor, 'mocha-runner', mochaConfigEditorFactory),
  declareClassPlugin(PluginKind.TestRunner, 'mocha', MochaTestRunner)
];

mochaConfigEditorFactory.inject = tokens(COMMON_TOKENS.injector);
function mochaConfigEditorFactory(injector: Injector<BaseContext>): MochaConfigEditor {
  return injector
    .provideClass('loader', MochaOptionsLoader)
    .injectClass(MochaConfigEditor);
}
