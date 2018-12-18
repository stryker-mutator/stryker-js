import { TestRunnerFactory } from 'stryker-api/test_runner';
import WctTestRunner from './WctTestRunner';

TestRunnerFactory.instance().register('wct', WctTestRunner);
