
import {StrykerOptions} from '../core';

export default class Config implements StrykerOptions {

  testFramework = 'jasmine';
  testRunner = 'karma';
  timeoutMs = 2000;
  timeoutFactor = 1.5;
  plugins: string[] = ['stryker-*'];
  port = 9234;

  public set(newConfig: StrykerOptions) {
    Object.keys(newConfig).forEach(function(key) {
      this[key] = newConfig[key];
    })
  }
}