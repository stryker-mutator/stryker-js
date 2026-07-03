import { EOL } from 'os';

import type { Diagnostic, DiagnosticCategory } from 'typescript7/unstable/sync';

/**
 * A located version of a diagnostic reported by the native TypeScript compiler (TypeScript 7).
 * Locations are resolved eagerly, because diagnostic positions refer to in-memory (mutated)
 * content that is reset after each check.
 */
export interface NativeDiagnostic {
  fileName: string | undefined;
  code: number;
  text: string;
}

/**
 * Mirrors `DiagnosticCategory.Error` of the TypeScript 7 API.
 * The value is inlined here because typescript7 is imported type-only (it is an optional dependency).
 */
export const diagnosticCategoryError = 1 as DiagnosticCategory.Error;

/**
 * Converts a diagnostic of the native TypeScript compiler to a located {@link NativeDiagnostic}.
 * @param diagnostic The diagnostic to convert
 * @param getContent Function to retrieve the content of a file as the compiler saw it (including in-memory mutations)
 */
export function toNativeDiagnostic(diagnostic: Diagnostic): NativeDiagnostic {
  return {
    fileName: diagnostic.fileName,
    code: diagnostic.code,
    text: flattenDiagnosticText(diagnostic),
  };
}

function flattenDiagnosticText(diagnostic: Diagnostic, indent = 0): string {
  const text = `${'  '.repeat(indent)}${diagnostic.text}`;
  return [
    text,
    ...(diagnostic.messageChain ?? []).map((chainedDiagnostic) =>
      flattenDiagnosticText(chainedDiagnostic, indent + 1),
    ),
  ].join(EOL);
}

/**
 * Formats diagnostics the same way as `ts.formatDiagnostics` does,
 * i.e. `path/to/file.ts(line,character): error TS1234: message`
 */
export function formatDiagnostics(
  diagnostics: readonly NativeDiagnostic[],
): string {
  return diagnostics
    .map((diagnostic) => {
      return `error TS${diagnostic.code}: ${diagnostic.text}${EOL}`;
    })
    .join('');
}
