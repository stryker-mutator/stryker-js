import os from 'os';
import { ChildProcessWithoutNullStreams } from 'child_process';

import { glob } from 'glob';
import * as tap from 'tap-parser';

import { TapParser } from './tap-parser-factory.js';

export function findTestyLookingFiles(globPatterns: string[]): Promise<string[]> {
  return glob(globPatterns, { ignore: ['**/node_modules/**'], posix: true });
}

export interface TapResult {
  result: tap.FinalResults;
  failedTests: tap.TapError[];
}

function parseTap(tapProcess: ChildProcessWithoutNullStreams, disableBail: boolean) {
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

export async function captureTapResult(tapProcess: ChildProcessWithoutNullStreams, disableBail: boolean): Promise<TapResult> {
  const exitAsPromised = new Promise<number>((resolve) => tapProcess.on('exit', resolve));
  const stderrOutput: Buffer[] = [];
  tapProcess.stderr.on('data', (chunk: Buffer) => {
    stderrOutput.push(chunk);
  });
  const [exitCodeResult, tapResult] = await Promise.all([exitAsPromised, parseTap(tapProcess, disableBail)]);

  if (exitCodeResult !== 0 && !tapResult.failedTests.length) {
    // The tap process errored, but we don't have any failed tests. This is probably a syntax error in the test file.
    throw new Error(
      `Tap process exited with code ${exitCodeResult}. To reproduce it yourself, use the following command: 
      cd "${process.cwd()}"
      ${tapProcess.spawnargs.map((arg, index) => (index === 0 ? arg : `"${arg}"`)).join(' ')}
      
      Stderr output:
      ${stderrOutput.join('')}`
    );
  }
  return tapResult;
}

export function parseArguments(args: string[], hookFile: string, testFile: string): string[] {
  const hookFilePlaceholder = '{{hookFile}}';
  const testFilePlaceholder = '{{testFile}}';

  if (!args.some((arg) => arg.includes(hookFilePlaceholder))) {
    args = ['-r', hookFilePlaceholder, ...args];
  }

  if (!args.some((arg) => arg.includes(testFilePlaceholder))) {
    args = [...args, testFilePlaceholder];
  }

  return args.map((arg) => arg.replace(testFilePlaceholder, testFile).replace(hookFilePlaceholder, hookFile));
}
