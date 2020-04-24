import { BaseContext, commonTokens, declareClassPlugin, declareFactoryPlugin, Injector, PluginKind, tokens } from '@stryker-mutator/api/plugin';

import MochaOptionsEditor from './MochaOptionsEditor';
import MochaOptionsLoader from './MochaOptionsLoader';
import { MochaTestRunner } from './MochaTestRunner';

export const strykerPlugins = [
  declareFactoryPlugin(PluginKind.OptionsEditor, 'mocha-runner', mochaOptionsEditorFactory),
  declareClassPlugin(PluginKind.TestRunner, 'mocha', MochaTestRunner),
];

mochaOptionsEditorFactory.inject = tokens(commonTokens.injector);
function mochaOptionsEditorFactory(injector: Injector<BaseContext>): MochaOptionsEditor {
  return injector.provideClass('loader', MochaOptionsLoader).injectClass(MochaOptionsEditor);
}

export * as strykerValidationSchema from '../schema/mocha-runner-options.json';
