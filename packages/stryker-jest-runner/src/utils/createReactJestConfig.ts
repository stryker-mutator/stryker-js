export default function createReactJestConfig(resolve: Function, projectRoot: string, ejected: boolean, loader?: NodeRequire): string {
  loader = loader || /* istanbul ignore next */ require;

  return loader('react-scripts/scripts/utils/createJestConfig')(resolve, projectRoot, ejected);
}