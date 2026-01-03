import { createVitest as createVitestOriginal } from 'vitest/node';
import { createRequire } from 'module';
import path from 'path';

export type * from 'vitest/node';

// Try to use vitest from the project's node_modules if available
async function createVitestFromProject(...args: Parameters<typeof createVitestOriginal>) {
  try {
    // Try to resolve vitest from the current working directory (the sandbox)
    const require = createRequire(path.join(process.cwd(), 'package.json'));
    const vitestPath = require.resolve('vitest/node');
    const { createVitest } = await import(vitestPath);
    return createVitest(...args);
  } catch {
    // Fall back to bundled vitest
    return createVitestOriginal(...args);
  }
}

export const vitestWrapper = {
  createVitest: createVitestFromProject,
};
