import { LogLevel, MutationScoreThresholds, MutatorDescriptor, StrykerOptions, TestRunnerDescriptor } from '../../core';

export default class Config implements StrykerOptions {

  [customConfig: string]: any;

  public files: string[];
  public mutate: string[];

  public logLevel: LogLevel = LogLevel.Information;
  public fileLogLevel: LogLevel = LogLevel.Off;
  public timeoutMS = 5000;
  public timeoutFactor = 1.5;
  public plugins: string[] = ['stryker-*'];
  public port = 9234;
  public reporter = [];
  public reporters: string[] = ['progress', 'clear-text'];
  public coverageAnalysis: 'perTest' | 'all' | 'off' = 'perTest';
  public testRunner: TestRunnerDescriptor = {
    name: 'command',
    settings: {}
  };
  public testFramework: string;
  public mutator: string | MutatorDescriptor = 'es5';
  public transpilers: string[] = [];
  public maxConcurrentTestRunners: number = Infinity;
  public symlinkNodeModules: boolean = true;
  public thresholds: MutationScoreThresholds = {
    break: null,
    high: 80,
    low: 60
  };
  public allowConsoleColors: boolean = true;

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
