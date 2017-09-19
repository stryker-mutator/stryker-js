import { StrykerOptions, Factory, File, InputFileDescriptor, FileKind, Position, Location, Range } from 'stryker-api/core';

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

const textFile: File = createFile({
  name: 'string',
  mutated: true,
  included: true,
  transpiled: true,
  content: 'string',
  kind: FileKind.Text
});
const binaryFile = createFile({
  name: '',
  mutated: false,
  included: false,
  transpiled: false,
  content: Buffer.from('sdssdsd'),
  kind: FileKind.Binary
});

const webFile = createFile({
  name: 'http://example.com',
  mutated: false,
  included: false,
  transpiled: false,
  kind: FileKind.Web
});

function createFile(file: File) {
  // needed to trick the ts compiler to make it an actual files
  return file;
}

// Test the type guards
if (textFile.kind === FileKind.Text) {
  console.log(textFile.content.substr(3));
}
if (binaryFile.kind === FileKind.Binary) {
  console.log(binaryFile.content.readInt16BE(0, true));
}
if (webFile.kind === FileKind.Web) {
  console.log('Web file does not have a content property');
}


let range: Range = [1, 2];
let filePatternDescriptor: InputFileDescriptor = { included: true, mutated: false, pattern: '/files/**/*.js' };
let position: Position = { column: 2, line: 2 };
let location: Location = { start: position, end: position };

console.log(range, position, location, textFile, optionsAllArgs, options, filePatternDescriptor);