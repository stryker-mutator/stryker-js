import { TestRunnerFactory } from 'stryker-api/test_runner';
import KarmaTestRunner from './KarmaTestRunner';

TestRunnerFactory.instance().register('karma', KarmaTestRunner);