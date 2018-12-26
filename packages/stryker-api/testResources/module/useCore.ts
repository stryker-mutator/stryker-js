import { File, Location, LogLevel, Position, Range, StrykerOptions } from 'stryker-api/core';

const options: StrykerOptions = {};
const optionsAllArgs: StrykerOptions = {
  configFile: 'string',
  files: ['some'],
  logLevel: LogLevel.Fatal,
  mutate: ['some'],
  plugins: ['string'],
  port: 3,
  reporter: 'string',
  repoters: ['reporter'],
  testFramework: 'string',
  testRunner: 'string',
  thresholds: {
    break: 60,
    high: 80,
    low: 70
  },
  timeoutFactor: 2,
  timeoutMS: 1
};

const textFile: File = new File('foo/bar.js', Buffer.from('foobar'));
const range: Range = [1, 2];
const position: Position = { column: 2, line: 2 };
const location: Location = { start: position, end: position };

console.log(range, position, location, textFile, optionsAllArgs, options);
