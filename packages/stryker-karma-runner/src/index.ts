import KarmaTestRunner from './KarmaTestRunner';
import {TestRunnerFactory} from 'stryker-api/test_runner';

TestRunnerFactory.instance().register('karma', KarmaTestRunner);
