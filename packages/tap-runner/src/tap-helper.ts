import { promisify } from 'util';

import nodeGlob from 'glob';

const glob = promisify(nodeGlob);

export async function findTestyLookingFiles(): Promise<string[]> {
  // regex used by node-tap
  // ((\/|^)(tests?|__tests?__)\/.*|\.(tests?|spec)|^\/?tests?) \.([mc]js|[jt]sx?)$
  const globPattern = '{**/@(test|tests|__test__|__tests__)/**,**/*.@(test|tests|spec)}.@(cjs|mjs|js|jsx|ts|tsx)';
  return glob(globPattern, { ignore: ['**/node_modules/**'] });
}
