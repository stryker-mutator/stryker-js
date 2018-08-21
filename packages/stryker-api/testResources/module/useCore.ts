import { StrykerOptions, File, Position, Location, Range, LogLevel } from 'stryker-api/core';

const options: StrykerOptions = {};
const optionsAllArgs: StrykerOptions = {
  files: ['some'],
  mutate: ['some'],
  configFile: 'string',
  testFramework: 'string',
  testRunner: 'string',
  reporter: 'string',
  repoters: ['reporter'],
  logLevel: LogLevel.Fatal,
  timeoutMS: 1,
  timeoutFactor: 2,
  plugins: ['string'],
  thresholds: {
    high: 80,
    low: 70,
    break: 60
  },
  port: 3,
};

const textFile: File = new File('foo/bar.js', Buffer.from('foobar'));
const range: Range = [1, 2];
const position: Position = { column: 2, line: 2 };
const location: Location = { start: position, end: position };

console.log(range, position, location, textFile, optionsAllArgs, options);