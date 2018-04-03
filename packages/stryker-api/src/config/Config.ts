import { StrykerOptions, MutatorDescriptor, MutationScoreThresholds } from '../../core';

export default class Config implements StrykerOptions {

  [customConfig: string]: any;

  files: string[];
  mutate: string[];

  logLevel = 'info';
  timeoutMs = 5000;
  timeoutFactor = 1.5;
  plugins: string[] = ['stryker-*'];
  port = 9234;
  reporter = ['progress', 'clear-text'];
  coverageAnalysis: 'perTest' | 'all' | 'off' = 'perTest';
  testRunner: string;
  testFramework: string;
  mutator: string | MutatorDescriptor = 'es5';
  transpilers: string[] = [];
  maxConcurrentTestRunners: number = Infinity;
  thresholds: MutationScoreThresholds = {
    high: 80,
    low: 60,
    break: null
  };

  public set(newConfig: StrykerOptions) {
    if (newConfig) {
      Object.keys(newConfig).forEach((key) => {
        if (typeof newConfig[key] !== 'undefined') {
          this[key] = newConfig[key];
        }
      });
    }
  }
}