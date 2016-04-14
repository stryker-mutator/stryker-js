
import {StrykerOptions} from '../core';

export default class Config implements StrykerOptions {

  [customConfig: string]: any;

  files: string[];
  mutate: string[];
  testFramework = 'jasmine';
  testRunner = 'karma';
  timeoutMs = 2000;
  timeoutFactor = 1.5;
  plugins: string[] = ['stryker-*'];
  port = 9234;

  public set(newConfig: StrykerOptions) {
    if (newConfig) {
      Object.keys(newConfig).forEach((key) => {
        this[key] = newConfig[key];
      });
    }
  }
}