const combine = (
  prefixes: string[],
  suffixes: string[],
  extensions: string[],
): string[] => {
  const fileNames: string[] = [];
  for (const prefix of prefixes) {
    for (const suffix of suffixes) {
      for (const extension of extensions) {
        fileNames.push(`${prefix}stryker${suffix}.${extension}`);
      }
    }
  }
  return fileNames;
};

export const SUPPORTED_CONFIG_FILE_NAMES = Object.freeze(
  combine(
    // Prefixes.
    ['', '.'],
    // Suffixes.
    ['.conf', '.config'],
    // Extensions.
    ['json', 'js', 'mjs', 'cjs'],
  ),
);

export const DEFAULT_CONFIG_FILE_NAMES = Object.freeze({
  JSON: 'stryker.config.json',
  JAVASCRIPT: 'stryker.config.mjs',
} as const);
