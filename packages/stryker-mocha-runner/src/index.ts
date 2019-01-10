import { TestRunnerFactory } from 'stryker-api/test_runner';
import { pluginFactory, PluginKind, StrykerContext } from 'stryker-api/plugin';

import MochaTestRunner from './MochaTestRunner';
import MochaConfigEditor from './MochaConfigEditor';
import { Injector, INJECTOR_TOKEN, tokens } from 'typed-inject';
import MochaOptionsLoader from './MochaOptionsLoader';

TestRunnerFactory.instance().register('mocha', MochaTestRunner);

export const strykerPlugins = [
  pluginFactory(PluginKind.ConfigEditor, 'mocha-runner', mochaConfigEditorFactory)
];

mochaConfigEditorFactory.inject = tokens(INJECTOR_TOKEN);
function mochaConfigEditorFactory(injector: Injector<StrykerContext>): MochaConfigEditor {
  return injector
    .provideClass('loader', MochaOptionsLoader)
    .injectClass(MochaConfigEditor);
}
