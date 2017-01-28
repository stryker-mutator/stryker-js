import {TestRunnerDefinition, TestFrameworkDefinition} from './initializer.conf';

export class ContextChoices {
  constructor(public testRunner: TestRunnerDefinition, public testFramework: TestFrameworkDefinition) { };
}