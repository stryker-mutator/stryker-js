import fs from 'fs';

import { tempTapOutputFileName, strykerDryRun, strykerHitLimit, strykerNamespace } from './env.cjs';

const strykerGlobalNamespace = (process.env[strykerNamespace] as '__stryker__' | '__stryker2__' | undefined) ?? '__stryker__';
const dryRun = process.env[strykerDryRun] === 'true';
const hitLimit = process.env[strykerHitLimit] ? +process.env[strykerHitLimit] : undefined;

global[strykerGlobalNamespace] = {};

if (hitLimit) {
  global[strykerGlobalNamespace]!.hitLimit = hitLimit;
  global[strykerGlobalNamespace]!.hitCount = 0;
}

process.on('exit', finalCleanup);

(['SIGABRT', 'SIGINT', 'SIGHUP', 'SIGTERM'] as const).forEach((signal) =>
  process.on(signal, (_: unknown, signalNumber: number) => {
    process.exit(128 + signalNumber);
  }),
);

function finalCleanup() {
  if (!dryRun) {
    delete global[strykerGlobalNamespace]!.mutantCoverage;
  }
  fs.writeFileSync(tempTapOutputFileName(process.pid), JSON.stringify(global[strykerGlobalNamespace]));
}
