import path from 'path';
import { fileURLToPath } from 'url';

export const resolveTestResource: typeof path.resolve = path.resolve.bind(
  path,
  path.dirname(fileURLToPath(import.meta.url)),
  '..' /* helpers */,
  '..' /* test */,
  '..' /* dist */,
  'testResources'
);
