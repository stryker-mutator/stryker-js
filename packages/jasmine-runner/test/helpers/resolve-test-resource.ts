import path from 'path';

export const resolveFromRoot = path.resolve.bind(path, __dirname, '..', '..', '..');
export const resolveTestResource = resolveFromRoot.bind(path, 'testResources');
