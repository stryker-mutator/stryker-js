import path from 'path';

import ts from 'typescript';
import semver from 'semver';

// Override some compiler options that have to do with code quality. When mutating, we're not interested in the resulting code quality
// See https://github.com/stryker-mutator/stryker-js/issues/391 for more info
const COMPILER_OPTIONS_OVERRIDES: Readonly<Partial<ts.CompilerOptions>> =
  Object.freeze({
    allowUnreachableCode: true,
    noUnusedLocals: false,
    noUnusedParameters: false,
  });

// When we're running in 'single-project' mode, we can safely disable emit
const NO_EMIT_OPTIONS_FOR_SINGLE_PROJECT: Readonly<
  Partial<ts.CompilerOptions>
> = Object.freeze({
  noEmit: true,
  incremental: false, // incremental and composite off: https://github.com/microsoft/TypeScript/issues/36917
  tsBuildInfoFile: undefined,
  composite: false,
});

// When we're running in 'project references' mode, we need to enable declaration output
const LOW_EMIT_OPTIONS_FOR_PROJECT_REFERENCES: Readonly<
  Partial<ts.CompilerOptions>
> = Object.freeze({
  emitDeclarationOnly: true,
  noEmit: false,
  declarationMap: true,
  declaration: true,
});

export function guardTSVersion(version = ts.version): void {
  if (!semver.satisfies(version, '>=3.6', { includePrerelease: true })) {
    throw new Error(
      `@stryker-mutator/typescript-checker only supports typescript@3.6 or higher. Found typescript@${version}`,
    );
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
  const useProjectReferences =
    'references' in
    ts.parseConfigFileTextToJson(tsconfigFileName, tsconfigFile).config;
  return useProjectReferences;
}

/**
 * Overrides some options to speed up compilation and disable some code quality checks we don't want during mutation testing
 * @param parsedConfig The parsed config file
 * @param useBuildMode whether or not `--build` mode is used
 */
export function overrideOptions(
  parsedConfig: { config?: any },
  useBuildMode: boolean,
): string {
  const compilerOptions = {
    ...parsedConfig.config?.compilerOptions,
    ...COMPILER_OPTIONS_OVERRIDES,
    ...(useBuildMode
      ? LOW_EMIT_OPTIONS_FOR_PROJECT_REFERENCES
      : NO_EMIT_OPTIONS_FOR_SINGLE_PROJECT),
  };

  if (
    !useBuildMode &&
    compilerOptions.declarationDir !== undefined &&
    compilerOptions.declarationDir !== null
  ) {
    // because composite and/or declaration was disabled in non-build mode, we have to disable declarationDir as well
    // otherwise, error TS5069: Option 'declarationDir' cannot be specified without specifying option 'declaration' or option 'composite'.
    delete compilerOptions.declarationDir;
  }

  if (useBuildMode) {
    // Remove the options to place declarations files in different locations to decrease the complexity of searching the source file in the TypescriptCompiler class.
    delete compilerOptions.inlineSourceMap;
    delete compilerOptions.inlineSources;
    delete compilerOptions.mapRoute;
    delete compilerOptions.sourceRoot;
    delete compilerOptions.outFile;
  }

  return JSON.stringify({
    ...parsedConfig.config,
    compilerOptions,
  });
}

/**
 * Retrieves the referenced config files based on parsed configuration
 * @param parsedConfig The parsed config file
 * @param fromDirName The directory where to resolve from
 */
export function retrieveReferencedProjects(
  parsedConfig: { config?: any },
  fromDirName: string,
): string[] {
  if (Array.isArray(parsedConfig.config?.references)) {
    return parsedConfig.config?.references.map(
      (reference: ts.ProjectReference) =>
        path.resolve(fromDirName, ts.resolveProjectReferencePath(reference)),
    );
  }
  return [];
}

/**
 * Replaces backslashes with forward slashes (used by typescript)
 * @param fileName The file name that may contain backslashes `\`
 * @returns posix and ts complaint file name (with `/`)
 */
export function toPosixFileName(fileName: string): string {
  return fileName.replace(/\\/g, '/');
}

/**
 * Find source file in declaration file
 * @param content The content of the declaration file
 * @returns URL of the source file or undefined if not found
 */
const findSourceMapRegex = /\/\/# sourceMappingURL=(.+)$/;
export function getSourceMappingURL(content: string): string | undefined {
  findSourceMapRegex.lastIndex = 0;
  return findSourceMapRegex.exec(content)?.[1];
}
