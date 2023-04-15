import { promisify } from 'util';

import nodeGlob from 'glob';

const glob = promisify(nodeGlob);

export async function findTestyLookingFiles(globPattern: string): Promise<string[]> {
  return glob(globPattern, { ignore: ['**/node_modules/**'] });
}
