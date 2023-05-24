import os from 'os';
import { ChildProcessWithoutNullStreams } from 'child_process';

import { glob } from 'glob';
import * as tap from 'tap-parser';

import { TapParser } from './tap-parser-factory.js';

export function findTestyLookingFiles(globPattern: string): Promise<string[]> {
  return glob(globPattern, { ignore: ['**/node_modules/**'], posix: true });
}

export interface TapResult {
  result: tap.FinalResults;
  failedTests: tap.TapError[];
}

export function parseTap(tapProcess: ChildProcessWithoutNullStreams, disableBail: boolean): Promise<TapResult> {
  return new Promise<TapResult>((resolve) => {
    const failedTests: tap.TapError[] = [];
    const config = { bail: !disableBail };
    const parser = TapParser.Parser(config, (result) => {
      resolve({ result, failedTests });
    });

    parser.on('bailout', () => {
      // Bailout within a test file is not supported on windows, because when the process is killed the exit handler which saves the file with the result does not run.
      if (os.platform() !== 'win32') {
        tapProcess.kill();
      }
    });

    parser.on('fail', (reason: tap.TapError) => {
      failedTests.push(reason);
    });
    tapProcess.stdout.pipe(parser);
  });
}
