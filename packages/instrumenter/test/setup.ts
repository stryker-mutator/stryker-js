import path from 'path';

import 'source-map-support/register.js';
import { use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import { testInjector } from '@stryker-mutator/test-helpers';
import chaiJestSnapshot from 'chai-jest-snapshot';
import type { Context } from 'mocha';
import { retrieveSourceMap } from 'source-map-support';

use(sinonChai);
use(chaiAsPromised);
use(chaiJestSnapshot);

let originalCwd: string;

export const mochaHooks = {
  afterEach(): void {
    sinon.restore();
    testInjector.reset();
    process.chdir(originalCwd);
  },

  before(): void {
    chaiJestSnapshot.resetSnapshotRegistry();
  },

  beforeEach(this: Context): void {
    originalCwd = process.cwd();
    chaiJestSnapshot.configureUsingMochaContext(this);
    chaiJestSnapshot.setFilename(snapshotFileFor(this.currentTest!.file!));
  },
};

const snapshotFileMap = new Map<string, string>();
function snapshotFileFor(outFile: string): string {
  let originalFile = snapshotFileMap.get(outFile);
  if (!originalFile) {
    const sourceMapContent: { sources: string[] } = JSON.parse(retrieveSourceMap(outFile)!.map as string);
    originalFile = path.resolve(path.dirname(outFile), sourceMapContent.sources[0]) + '.snap';
    snapshotFileMap.set(outFile, originalFile);
  }
  return originalFile;
}
