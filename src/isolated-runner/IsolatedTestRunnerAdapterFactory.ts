import IsolatedTestRunnerAdapter from './IsolatedTestRunnerAdapter';
import IsolatedRunnerOptions from './IsolatedRunnerOptions';



export default {
  create(settings: IsolatedRunnerOptions): IsolatedTestRunnerAdapter {
    return new IsolatedTestRunnerAdapter(settings.strykerOptions.testRunner, settings);
  }
};