import { promisify } from 'util';

import nodeGlob from 'glob';

const glob = promisify(nodeGlob);

export async function FindTestyLookingFiles(): Promise<string[]> {
  // regex used by node-tap
  // ((\/|^)(tests?|__tests?__)\/.*|\.(tests?|spec)|^\/?tests?)\.([mc]js|[jt]sx?)$
  const firstFolderGlob = '**/@(test|tests|__test__|__tests__)/**';
  const secondFolderGlob = '**/*.@(test|tests|spec)';
  const fileExtensions = '.@(cjs|mjs|js|jsx|ts|tsx)';

  const results = await Promise.all([glob(`${firstFolderGlob}${fileExtensions}`), glob(`${secondFolderGlob}${fileExtensions}`)]);
  return [...new Set(results.flat())];
}
