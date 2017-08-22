import { StrykerOptions, Factory, File, InputFileDescriptor, Position, Location, Range } from 'stryker-api/core';

let options: StrykerOptions = {};
let optionsAllArgs: StrykerOptions = {
  files: ['some', { pattern: 'file' }, { included: false, mutated: true, pattern: 'some pattern' }],
  mutate: ['some'],
  configFile: 'string',
  testFramework: 'string',
  testRunner: 'string',
  reporter: 'string',
  logLevel: 'string',
  timeoutMs: 1,
  timeoutFactor: 2,
  plugins: ['string'],
  thresholds: {
    high: 80,
    low: 70,
    break: 60
  },
  port: 3,
};

const textFile: File = {
  name: 'string',
  mutated: true,
  included: true,
  content: 'string'
};
const binaryFile: File = {
  name: '',
  mutated: false,
  included: false,
  content: Buffer.from('sdssdsd')
};

if (typeof textFile.content === 'string') {
  console.log(textFile.content.substr(3));
}
if (Buffer.isBuffer(binaryFile.content)) {
  console.log(binaryFile.content.readInt16BE(0, true));
}


let range: Range = [1, 2];
let filePatternDescriptor: InputFileDescriptor = { included: true, mutated: false, pattern: '/files/**/*.js' };
let position: Position = { column: 2, line: 2 };
let location: Location = { start: position, end: position };

console.log(range, position, location, textFile, optionsAllArgs, options, filePatternDescriptor);