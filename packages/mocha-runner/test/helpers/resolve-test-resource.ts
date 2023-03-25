import path from 'path';
import { fileURLToPath } from 'url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export const resolveTestResource: typeof path.resolve = path.resolve.bind(
  path,
  dirname,
  '..' /* helpers */,
  '..' /* test */,
  '..' /* dist */,
  'testResources'
);
