import { LogLevel, MutationScoreThresholds, MutatorDescriptor, StrykerOptions, DashboardOptions, ReportType } from '../../core';

import defaultTempDirName from './DefaultTempDirName';

/**
 * When configuring stryker, every option is optional
 * Including deep properties like `dashboard.project`.
 * That's why we use a `DeepPartial` mapped type here.
 */
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export default class Config implements StrykerOptions {
  [customConfig: string]: any;

  public files: string[];
  public mutate: string[] = [
    '{src,lib}/**/*.js?(x)',
    '!{src,lib}/**/__tests__/**/*.js?(x)',
    '!{src,lib}/**/?(*.)+(spec|test).js?(x)',
    '!{src,lib}/**/*+(Spec|Test).js?(x)'
  ];

  public logLevel: LogLevel = LogLevel.Information;
  public fileLogLevel: LogLevel = LogLevel.Off;
  public timeoutMS = 5000;
  public timeoutFactor = 1.5;
  public plugins: string[] = ['@stryker-mutator/*'];
  public reporters: string[] = ['progress', 'clear-text'];
  public coverageAnalysis: 'perTest' | 'all' | 'off' = 'off';
  public testRunner: string = 'command';
  public testFramework: string;
  public mutator: string | MutatorDescriptor = 'javascript';
  public transpilers: string[] = [];
  public maxConcurrentTestRunners: number = Infinity;
  public symlinkNodeModules: boolean = true;
  public thresholds: MutationScoreThresholds = {
    break: null,
    high: 80,
    low: 60
  };

  public allowConsoleColors: boolean = true;
  /**
   * The options for the 'dashboard' reporter
   */
  public dashboard: DashboardOptions = {
    baseUrl: 'https://dashboard.stryker-mutator.io/api/reports',
    reportType: ReportType.Full
  };
  public tempDirName: string = defaultTempDirName;

  public set(newConfig: DeepPartial<StrykerOptions>) {
    if (newConfig) {
      Object.keys(newConfig).forEach(key => {
        if (newConfig[key] !== undefined) {
          if (key === 'dashboard') {
            this[key] = { ...this[key], ...newConfig[key] };
          } else {
            this[key] = newConfig[key];
          }
        }
      });
    }
  }
}
