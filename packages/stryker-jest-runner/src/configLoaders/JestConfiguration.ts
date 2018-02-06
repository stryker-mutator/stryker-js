// Grabbed from https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/jest/index.d.ts

export type Path = string;
export type Glob = string;
export type ConfigGlobals = object;

// flow's Maybe type https://flow.org/en/docs/types/primitives/#toc-maybe-types
export type Maybe<T> = void | null | undefined | T; // tslint:disable-line:void-return

export interface HasteConfig {
  defaultPlatform?: Maybe<string>;
  hasteImplModulePath?: string;
  platforms?: string[];
  providesModuleNodeModules: string[];
}

export default interface JestConfiguration {
  automock: boolean;
  browser: boolean;
  cache: boolean;
  cacheDirectory: Path;
  clearMocks: boolean;
  coveragePathIgnorePatterns: string[];
  cwd: Path;
  detectLeaks: boolean;
  displayName: Maybe<string>;
  forceCoverageMatch: Glob[];
  globals: ConfigGlobals;
  haste: HasteConfig;
  moduleDirectories: string[];
  moduleFileExtensions: string[];
  moduleLoader: Path;
  moduleNameMapper: Array<[string, string]>;
  modulePathIgnorePatterns: string[];
  modulePaths: string[];
  name: string;
  resetMocks: boolean;
  resetModules: boolean;
  resolver: Maybe<Path>;
  rootDir: Path;
  roots: Path[];
  runner: string;
  setupFiles: Path[];
  setupTestFrameworkScriptFile: Path;
  skipNodeResolution: boolean;
  snapshotSerializers: Path[];
  testEnvironment: string;
  testEnvironmentOptions: object;
  testLocationInResults: boolean;
  testMatch: Glob[];
  testPathIgnorePatterns: string[];
  testRegex: string;
  testRunner: string;
  testURL: string;
  timers: 'real' | 'fake';
  transform: Array<[string, Path]>;
  transformIgnorePatterns: Glob[];
  unmockedModulePathPatterns: Maybe<string[]>;
  watchPathIgnorePatterns: string[];
}
