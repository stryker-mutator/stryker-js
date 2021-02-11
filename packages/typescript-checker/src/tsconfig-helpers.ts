import { resolve } from 'path';

import ts from 'typescript';
import semver from 'semver';

// Override some compiler options that have to do with code quality. When mutating, we're not interested in the resulting code quality
// See https://github.com/stryker-mutator/stryker/issues/391 for more info
const COMPILER_OPTIONS_OVERRIDES: Readonly<Partial<ts.CompilerOptions>> = Object.freeze({
  allowUnreachableCode: true,
  noUnusedLocals: false,
  noUnusedParameters: false,
});

// When we're running in 'single-project' mode, we can safely disable emit
const NO_EMIT_OPTIONS_FOR_SINGLE_PROJECT: Readonly<Partial<ts.CompilerOptions>> = Object.freeze({
  noEmit: true,
  incremental: false, // incremental and composite off: https://github.com/microsoft/TypeScript/issues/36917
  composite: false,
  declaration: false,
});

// When we're running in 'project references' mode, we need to enable declaration output
const LOW_EMIT_OPTIONS_FOR_PROJECT_REFERENCES: Readonly<Partial<ts.CompilerOptions>> = Object.freeze({
  emitDeclarationOnly: true,
  noEmit: false,
  declarationMap: false,
});

export function guardTSVersion(): void {
  if (!semver.satisfies(ts.version, '>=3.6')) {
    throw new Error(`@stryker-mutator/typescript-checker only supports typescript@3.6 our higher. Found typescript@${ts.version}`);
  }
}

/**
 * Determines whether or not to use `--build` mode based on "references" being there in the config file
 * @param tsconfigFileName The tsconfig file to parse
 */
export function determineBuildModeEnabled(tsconfigFileName: string): boolean {
  const tsconfigFile = ts.sys.readFile(tsconfigFileName);
  if (!tsconfigFile) {
    throw new Error(`File "${tsconfigFileName}" not found!`);
  }
  const useProjectReferences = 'references' in ts.parseConfigFileTextToJson(tsconfigFileName, tsconfigFile).config;
  return useProjectReferences;
}

/**
 * Overrides some options to speed up compilation and disable some code quality checks we don't want during mutation testing
 * @param parsedConfig The parsed config file
 * @param useBuildMode whether or not `--build` mode is used
 */
export function overrideOptions(parsedConfig: { config?: any }, useBuildMode: boolean): string {
  const config = {
    ...parsedConfig.config,
    compilerOptions: {
      ...parsedConfig.config?.compilerOptions,
      ...COMPILER_OPTIONS_OVERRIDES,
      ...(useBuildMode ? LOW_EMIT_OPTIONS_FOR_PROJECT_REFERENCES : NO_EMIT_OPTIONS_FOR_SINGLE_PROJECT),
    },
  };
  return JSON.stringify(config);
}

/**
 * Retrieves the referenced config files based on parsed configuration
 * @param parsedConfig The parsed config file
 */
export function retrieveReferencedProjects(parsedConfig: { config?: any }): string[] {
  if (Array.isArray(parsedConfig.config?.references)) {
    return parsedConfig.config?.references.map((reference: any) => resolve(ts.resolveProjectReferencePath(reference)));
  }
  return [];
}
