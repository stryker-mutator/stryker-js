import { TestRunnerFactory, TestRunner, RunnerOptions } from 'stryker-api/test_runner';
import IsolatedTestRunnerAdapter from './IsolatedTestRunnerAdapter';

export default {
  create(settings: RunnerOptions): IsolatedTestRunnerAdapter {
    return new IsolatedTestRunnerAdapter(settings.strykerOptions.testRunner, settings);
  }
};