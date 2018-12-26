import { LogLevel, MutationScoreThresholds, MutatorDescriptor, StrykerOptions } from '../../core';

export default class Config implements StrykerOptions {

  [customConfig: string]: any;
  public allowConsoleColors = true;
  public coverageAnalysis: 'perTest' | 'all' | 'off' = 'off';
  public fileLogLevel: LogLevel = LogLevel.Off;

  public files: string[];

  public logLevel: LogLevel = LogLevel.Information;
  public maxConcurrentTestRunners = Infinity;
  public mutate: string[] = [
    '{src,lib}/**/*.js?(x)',
    '!{src,lib}/**/__tests__/**/*.js?(x)',
    '!{src,lib}/**/?(*.)+(spec|test).js?(x)',
    '!{src,lib}/**/*+(Spec|Test).js?(x)'
  ];
  public mutator: string | MutatorDescriptor = 'es5';
  public plugins: string[] = ['stryker-*'];
  public port = 9234;
  public reporter = [];
  public reporters: string[] = ['progress', 'clear-text'];
  public symlinkNodeModules = true;
  public testFramework: string;
  public testRunner = 'command';
  public thresholds: MutationScoreThresholds = {
    break: null,
    high: 80,
    low: 60
  };
  public timeoutFactor = 1.5;
  public timeoutMS = 5000;
  public transpilers: string[] = [];

  public set(newConfig: StrykerOptions) {
    if (newConfig) {
      Object.keys(newConfig).forEach(key => {
        if (typeof newConfig[key] !== 'undefined') {
          this[key] = newConfig[key];
        }
      });
    }
  }
}
