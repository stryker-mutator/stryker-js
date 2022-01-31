import path from 'path';

export const resolveFromRoot = path.resolve.bind(path, __dirname, '..', '..', '..');
export const resolveTestResource = resolveFromRoot.bind(path, 'testResources');

export const resolveTempTestResourceDirectory: typeof path.resolve = () => {
  return path.resolve(__dirname, '..' /* helpers */, '..' /* test */, '..' /* dist */, 'testResources', 'tmp', `workDir${random()}`);
};

function random(): number {
  return Math.ceil(Math.random() * 10000000);
}
