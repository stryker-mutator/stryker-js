import { LoggerFactoryMethod } from '../../logging';
import { TestFrameworkSettings } from '../../test_framework';

export interface Injections {
  testFrameworkSettings: TestFrameworkSettings;
  getLogger: LoggerFactoryMethod;
}
