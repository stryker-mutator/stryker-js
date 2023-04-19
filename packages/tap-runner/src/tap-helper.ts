import os from 'os';
import { promisify } from 'util';
import { ChildProcessWithoutNullStreams } from 'child_process';

import nodeGlob from 'glob';
import * as tap from 'tap-parser';

const glob = promisify(nodeGlob);

export async function findTestyLookingFiles(globPattern: string): Promise<string[]> {
  return glob(globPattern, { ignore: ['**/node_modules/**'] });
}

export interface TapResult {
  result: tap.FinalResults;
  failedTests: tap.TapError[];
}

export function parseTap(tapProcess: ChildProcessWithoutNullStreams, disableBail: boolean): Promise<TapResult> {
  return new Promise<TapResult>((resolve) => {
    const failedTests: tap.TapError[] = [];
    const config = { bail: !disableBail };
    const parser = new tap.Parser(config, async (result) => {
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
