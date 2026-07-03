import { createRequire } from 'module';
import path from 'path';
import { pathToFileURL } from 'url';

export type TypeScript7SyncApi = typeof import('typescript7/unstable/sync');

/**
 * Loads the (unstable) sync API of the native TypeScript compiler preview (TypeScript 7).
 * Users are expected to have installed it under the "typescript7" alias:
 * `npm install --save-dev typescript7@npm:typescript@latest`
 */
export async function loadTypescript7(): Promise<TypeScript7SyncApi> {
  try {
    return await import('typescript7/unstable/sync');
  } catch {
    try {
      // Fall back to resolving from the current working directory (the project under test)
      const require = createRequire(path.resolve('package.json'));
      return (await import(
        pathToFileURL(require.resolve('typescript7/unstable/sync')).href
      )) as TypeScript7SyncApi;
    } catch {
      throw new Error(
        'Could not load the native TypeScript compiler preview (tried to load "typescript7/unstable/sync"). In order to use "typescriptChecker": { "experimentalNativePreview": true }, please install TypeScript 7 under the "typescript7" alias: `npm install --save-dev typescript7@npm:typescript@latest`',
      );
    }
  }
}
