import path from 'path';
import { fileURLToPath } from 'url';

const dirname = path.dirname(fileURLToPath(import.meta.url));
export const resolveFromRoot = path.resolve.bind(path, dirname, '..', '..', '..');
export const resolveTestResource = resolveFromRoot.bind(path, 'testResources');
