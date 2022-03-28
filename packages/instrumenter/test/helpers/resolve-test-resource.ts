import path from 'path';
import { fileURLToPath } from 'url';

export const resolveFromRoot = path.resolve.bind(path, path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
export const resolveTestResource = resolveFromRoot.bind(path, 'testResources');
