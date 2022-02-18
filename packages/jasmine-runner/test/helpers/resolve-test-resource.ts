import path from 'path';
import { fileURLToPath } from 'url';

const dirname = path.dirname(fileURLToPath(import.meta.url));
export const resolveFromRoot = path.resolve.bind(path, dirname, '..', '..', '..');
export const resolveTestResource = resolveFromRoot.bind(path, 'testResources');

export const resolveTempTestResourceDirectory: typeof path.resolve = () => {
  return path.resolve(dirname, '..' /* helpers */, '..' /* test */, '..' /* dist */, 'testResources', 'tmp', `workDir${random()}`);
};

function random(): number {
  return Math.ceil(Math.random() * 10000000);
}
