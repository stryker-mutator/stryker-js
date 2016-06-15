
import {StrykerOptions} from '../core';

export default class Config implements StrykerOptions {

  [customConfig: string]: any;

  files: string[];
  mutate: string[];
  
  logLevel = 'info';
  testFramework: string;
  testRunner: string;
  timeoutMs = 5000;
  timeoutFactor = 1.5;
  plugins: string[] = ['stryker-*'];
  port = 9234;
  reporter = ['progress', 'clear-text'];

  public set(newConfig: StrykerOptions) {
    if (newConfig) {
      Object.keys(newConfig).forEach((key) => {
        this[key] = newConfig[key];
      });
    }
  }
}