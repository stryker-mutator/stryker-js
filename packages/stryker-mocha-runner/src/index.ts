import { TestRunnerFactory } from 'stryker-api/test_runner';
import { declareFactoryPlugin, PluginKind, BaseContext, tokens, commonTokens, Injector } from 'stryker-api/plugin';

import MochaTestRunner from './MochaTestRunner';
import MochaConfigEditor from './MochaConfigEditor';
import MochaOptionsLoader from './MochaOptionsLoader';

TestRunnerFactory.instance().register('mocha', MochaTestRunner);

export const strykerPlugins = [
  declareFactoryPlugin(PluginKind.ConfigEditor, 'mocha-runner', mochaConfigEditorFactory)
];

mochaConfigEditorFactory.inject = tokens(commonTokens.injector);
function mochaConfigEditorFactory(injector: Injector<BaseContext>): MochaConfigEditor {
  return injector
    .provideClass('loader', MochaOptionsLoader)
    .injectClass(MochaConfigEditor);
}
