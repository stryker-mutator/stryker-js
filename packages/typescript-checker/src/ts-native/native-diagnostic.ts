import { EOL } from 'os';
import path from 'path';

import type {
  Diagnostic,
  DiagnosticCategory,
} from '@typescript/native/unstable/sync';
import { PositionConverter } from './position-converter.js';
import { toPosixFileName } from '../tsconfig-helpers.js';
/**
 * A located version of a diagnostic reported by the native TypeScript compiler (TypeScript 7).
 * Locations are resolved eagerly, because diagnostic positions refer to in-memory (mutated)
 * content that is reset after each check.
 */
export interface NativeDiagnostic {
  fileName: string | undefined;
  code: number;
  text: string;
  column: number;
  line: number;
}

/**
 * Mirrors `DiagnosticCategory.Error` of the TypeScript 7 API.
 * The value is inlined here because @typescript/native is imported type-only (it is an optional dependency).
 */
export const diagnosticCategoryError = 1 as DiagnosticCategory.Error;

/**
 * Converts a diagnostic of the native TypeScript compiler to a located {@link NativeDiagnostic}.
 * @param diagnostic The diagnostic to convert
 * @param positionConverter The position converter to use
 */
export function toNativeDiagnostic(
  diagnostic: Diagnostic,
  positionConverter?: PositionConverter,
): NativeDiagnostic {
  const { line, column } = positionConverter?.positionFromOffset(
    diagnostic.pos,
  ) ?? { line: 1, column: 1 };
  return {
    fileName: diagnostic.fileName
      ? toPosixFileName(path.relative('.', diagnostic.fileName))
      : undefined,
    code: diagnostic.code,
    text: flattenDiagnosticText(diagnostic),
    column,
    line,
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
      return `${diagnostic.fileName}(${diagnostic.line},${diagnostic.column}): error TS${diagnostic.code}: ${diagnostic.text}${EOL}`;
    })
    .join('');
}
