import { createRequire } from 'module';
import { pathToFileURL } from "node:url";
import path from 'path';
import { createVitest as createVitestOriginal } from 'vitest/node';

/**
 * Creates a Vitest instance, preferring the project's local installation.
 *
 * This fixes the "dual instance" problem (issue #5714) where Vitest plugins
 * (like @fast-check/vitest) register themselves globally on one Vitest instance,
 * but Stryker uses a different bundled instance, causing plugins to fail.
 *
 * By loading the project's local Vitest instance, we ensure that:
 * 1. Plugins register on the same instance that Stryker uses
 * 2. All Vitest features and plugins work correctly during mutation testing
 *
 * Falls back to Stryker's bundled Vitest if the project doesn't have it installed.
 */
async function createVitest(...args: Parameters<typeof createVitestOriginal>) {
  try {
    // Try to load the project's local Vitest installation
    const require = createRequire(path.join(process.cwd(), 'package.json'));
    const vitestPath = require.resolve('vitest/node');

    const { createVitest: createVitestProject } = await import(pathToFileURL(vitestPath).href);
    return createVitestProject(...args);
  } catch {
    // Fallback to Stryker's bundled Vitest if project doesn't have it
    return createVitestOriginal(...args);
  }
}

export const vitestWrapper = {
  createVitest,
};

export type * from 'vitest/node';
