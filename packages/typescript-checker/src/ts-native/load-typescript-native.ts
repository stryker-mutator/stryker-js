export type TypeScriptNativeSyncApi =
  typeof import('@typescript/native/unstable/sync');

const NATIVE_SYNC_API_SPECIFIER = '@typescript/native/unstable/sync';

export const nativeModuleLoader = {
  importModule(specifier: string): Promise<unknown> {
    return import(specifier);
  },
};

/**
 * Loads the (unstable) sync API of the native TypeScript compiler preview (TypeScript 7).
 * Users are expected to have installed it under the "@typescript/native" alias:
 * `npm install --save-dev @typescript/native@npm:typescript@latest`
 */
export async function loadTypescriptNative(): Promise<TypeScriptNativeSyncApi> {
  try {
    return (await nativeModuleLoader.importModule(
      NATIVE_SYNC_API_SPECIFIER,
    )) as TypeScriptNativeSyncApi;
  } catch (error) {
    throw new Error(
      `Could not load the native TypeScript compiler preview (tried to load "${NATIVE_SYNC_API_SPECIFIER}"). In order to use "typescriptChecker": { "experimentalNativePreview": true }, please install TypeScript 7 under the "@typescript/native" alias: \`npm install --save-dev @typescript/native@npm:typescript@latest\``,
      { cause: error },
    );
  }
}
