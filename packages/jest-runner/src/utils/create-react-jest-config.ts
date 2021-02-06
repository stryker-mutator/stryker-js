import { Config } from '@jest/types';

const resolveCreateJestConfig = (path: string, loader?: NodeRequire): ((...args: any[]) => any) => {
  loader = loader ?? /* istanbul ignore next */ require;

  return loader(path);
};

export function createReactJestConfig(
  resolve: (...args: any[]) => any,
  projectRoot: string,
  ejected: boolean,
  loader?: NodeRequire
): Config.InitialOptions {
  return resolveCreateJestConfig('react-scripts/scripts/utils/createJestConfig', loader)(resolve, projectRoot, ejected);
}

export function createReactTsJestConfig(
  resolve: (...args: any[]) => any,
  projectRoot: string,
  ejected: boolean,
  loader?: NodeRequire
): Config.InitialOptions {
  return resolveCreateJestConfig('react-scripts-ts/scripts/utils/createJestConfig', loader)(resolve, projectRoot, ejected);
}
