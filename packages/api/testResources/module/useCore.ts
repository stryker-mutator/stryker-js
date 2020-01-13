import { StrykerOptions, File, Position, Location, Range, LogLevel, ReportType } from '@stryker-mutator/api/core';

const optionsAllArgs: StrykerOptions = {
  allowConsoleColors: true,
  configFile: '',
  coverageAnalysis: 'off',
  fileLogLevel: LogLevel.Off,
  files: [],
  logLevel: LogLevel.Information,
  maxConcurrentTestRunners: 3,
  mutate: [],
  mutator: '',
  plugins: [],
  reporters: [],
  symlinkNodeModules: true,
  testFramework: '',
  testRunner: 'command',
  thresholds: { high: 80, low: 20, break: null},
  timeoutFactor: 1.5,
  timeoutMS: 5000,
  transpilers: [],
  dashboard: {
    baseUrl: 'baseUrl',
    reportType: ReportType.MutationScore,
    module: 'module',
    project: 'project',
    version: 'version'
  },
  tempDirName: '.stryker-tmp',
  collectStatistics: 'yes',
};

const textFile: File = new File('foo/bar.js', Buffer.from('foobar'));
const range: Range = [1, 2];
const position: Position = { column: 2, line: 2 };
const location: Location = { start: position, end: position };

console.log(range, position, location, textFile, optionsAllArgs);
