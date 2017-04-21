import { TestRunnerFactory } from 'stryker-api/test_runner';
import { ConfigWriterFactory } from 'stryker-api/config';
import KarmaTestRunner from './KarmaTestRunner';
import KarmaConfigWriter from './KarmaConfigWriter';

TestRunnerFactory.instance().register('karma', KarmaTestRunner);
ConfigWriterFactory.instance().register('karma', KarmaConfigWriter);