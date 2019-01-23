import fs = require('fs');
import path = require('path');
import ts = require('typescript');
import { expect } from 'chai';

describe('typed-inject', () => {

  fs.readdirSync(testResource())
    .forEach(tsFile => {
      it(path.basename(tsFile), async () => {
        const fileName = testResource(tsFile);
        const firstLine = await readFirstLine(fileName);
        const expectedErrorMessage = parseExpectedError(firstLine);
        const actualError = findActualError(fileName);
        if (expectedErrorMessage) {
          expect(actualError).contains(expectedErrorMessage);
        } else {
          expect(actualError).undefined;
        }
      });
    });
});

let program: ts.Program | undefined;
function findActualError(fileName: string) {
  program = ts.createProgram([fileName], {
    module: ts.ModuleKind.ES2015,
    strict: true,
    target: ts.ScriptTarget.ESNext,
    types: [
      'node'
    ]
  }, undefined, program);
  const diagnostics = ts.getPreEmitDiagnostics(program)
    .map(diagnostic => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
  expect(diagnostics.length).lessThan(2, diagnostics.join(', '));
  return diagnostics[0];
}

function parseExpectedError(line: string): string | undefined {
  const expectationRegex = /\/\/\s*error:\s*(.*)/;
  const result = expectationRegex.exec(line);
  if (result) {
    const expectation: string = result[1];
    const error: unknown = JSON.parse(expectation);
    if (!error) {
      return undefined;
    } else if (typeof error === 'string') {
      return error;
    } else {
      expect.fail(`Unable to parse expectation: ${line}, use a JSON string or undefined`);
      throw new Error();
    }
  } else {
    expect.fail(`Unable to parse expectation: ${line}, make sure file starts with '// error: "expected error"`);
    throw new Error();
  }
}

function readFile(fileName: string): Promise<string> {
  return new Promise((res, rej) => {
    fs.readFile(fileName, 'utf8', (err, result) => {
      if (err) {
        rej(err);
      } else {
        res(result);
      }
    });
  });
}

function testResource(relativePath?: string) {
  return path.resolve(__dirname, '..', '..', 'testResources', relativePath || '.');
}

async function readFirstLine(fileName: string) {
  const file = await readFile(fileName);
  const line = file.split('\n').shift();
  if (!line) {
    expect.fail(`No content found in file: ${fileName}`);
    throw new Error();
  } else {
    return line;
  }
}
