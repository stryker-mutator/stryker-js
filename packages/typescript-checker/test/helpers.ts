import ts from 'typescript';

export function createTSDiagnostic(overrides?: Partial<ts.Diagnostic>): ts.Diagnostic {
  return {
    category: ts.DiagnosticCategory.Error,
    code: 42,
    file: undefined,
    length: undefined,
    messageText: 'foo',
    start: undefined,
    ...overrides,
  };
}
