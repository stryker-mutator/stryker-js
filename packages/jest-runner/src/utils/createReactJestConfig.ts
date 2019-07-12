import jest from 'jest';

const resolveCreateJestConfig = (path: string, loader?: NodeRequire): Function => {
  loader = loader || /* istanbul ignore next */ require;

  return loader(path);
};

export function createReactJestConfig(resolve: Function, projectRoot: string, ejected: boolean, loader?: NodeRequire): jest.Configuration {
  return resolveCreateJestConfig('react-scripts/scripts/utils/createJestConfig', loader)(resolve, projectRoot, ejected);
}

export function createReactTsJestConfig(resolve: Function, projectRoot: string, ejected: boolean, loader?: NodeRequire): jest.Configuration {
  return resolveCreateJestConfig('react-scripts-ts/scripts/utils/createJestConfig', loader)(resolve, projectRoot, ejected);
}
