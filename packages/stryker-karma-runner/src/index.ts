import { TestRunnerFactory } from 'stryker-api/test_runner';
import { ConfigEditorFactory } from 'stryker-api/config';
import KarmaTestRunner from './KarmaTestRunner';
import KarmaConfigWriter from './KarmaConfigWriter';

TestRunnerFactory.instance().register('karma', KarmaTestRunner);
ConfigEditorFactory.instance().register('karma', KarmaConfigWriter);