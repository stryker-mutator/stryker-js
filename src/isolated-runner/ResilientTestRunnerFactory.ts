import { TestRunnerFactory, TestRunner } from 'stryker-api/test_runner';
import IsolatedTestRunnerAdapter from './IsolatedTestRunnerAdapter';
import IsolatedRunnerOptions from './IsolatedRunnerOptions';
import TimeoutDecorator from './TimeoutDecorator';


export default {
  create(testRunnerName: string, settings: IsolatedRunnerOptions): TestRunner {
    return new TimeoutDecorator(() => new IsolatedTestRunnerAdapter(testRunnerName, settings));
  }
};