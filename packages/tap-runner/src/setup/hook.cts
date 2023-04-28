import fs from 'fs';

import { strykerDryRun, strykerHitLimit, strykerNamespace } from './env.cjs';

const strykerGlobalNamespace = process.env[strykerNamespace] as '__stryker__' | '__stryker2__';
const dryRun = process.env[strykerDryRun] === 'true';
const hitLimit = process.env[strykerHitLimit] ? +process.env[strykerHitLimit] : undefined;

if (!strykerGlobalNamespace) {
  throw new Error('Stryker global namespace not set');
}

global[strykerGlobalNamespace] = {};

if (hitLimit) {
  global[strykerGlobalNamespace]!.hitLimit = hitLimit;
  global[strykerGlobalNamespace]!.hitCount = 0;
}

process.on('exit', finalCleanup);

(['SIGABRT', 'SIGINT', 'SIGHUP', 'SIGTERM'] as const).forEach((signal) =>
  process.on(signal, (_: unknown, signalNumber: number) => {
    process.exit(128 + signalNumber);
  })
);

function finalCleanup() {
  if (!dryRun) {
    delete global[strykerGlobalNamespace]!.mutantCoverage;
  }
  fs.writeFileSync(`stryker-output-${process.pid}.json`, JSON.stringify(global[strykerGlobalNamespace]));
}
