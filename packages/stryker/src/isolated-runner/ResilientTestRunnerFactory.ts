import IsolatedTestRunnerAdapter from './IsolatedTestRunnerAdapter';
import IsolatedRunnerOptions from './IsolatedRunnerOptions';
import TimeoutDecorator from './TimeoutDecorator';
import RetryDecorator from './RetryDecorator';
import TestRunnerDecorator from './TestRunnerDecorator';


export default {
  create(testRunnerName: string, settings: IsolatedRunnerOptions): TestRunnerDecorator {
    return new RetryDecorator(() =>
      new TimeoutDecorator(() => new IsolatedTestRunnerAdapter(testRunnerName, settings)));
  }
};