import { createRequire } from 'module';
import { pathToFileURL } from 'node:url';
import path from 'path';
import {
  createVitest as createVitestOriginal,
  version as originalVersion,
} from 'vitest/node';

// Try to load the project's local Vitest installation
let createVitest = createVitestOriginal;
let version = originalVersion;

try {
  const require = createRequire(path.join(process.cwd(), 'package.json'));
  const vitestPath = require.resolve('vitest/node');
  ({ createVitest, version } = await import(pathToFileURL(vitestPath).href));
} catch {
  // Idle, fallback is 'vitest/node' which is already assigned
}

export const vitestWrapper = {
  createVitest,
  version,
};

export type * from 'vitest/node';
