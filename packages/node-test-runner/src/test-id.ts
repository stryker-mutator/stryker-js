const SEPARATOR = String.fromCharCode(0);

export function toTestId(relativeFile: string, name: string): string {
  // a file that fails to load is reported as a placeholder test named after the file
  return name === relativeFile
    ? relativeFile
    : `${relativeFile}${SEPARATOR}${name}`;
}

export function fileOfTestId(id: string): string {
  const index = id.indexOf(SEPARATOR);
  return index === -1 ? id : id.slice(0, index);
}

export function nameOfTestId(id: string): string {
  const index = id.indexOf(SEPARATOR);
  return index === -1 ? id : id.slice(index + 1);
}

// Prefix of the diagnostic the setup hook emits to carry the running test's id.
export const TEST_ID_MARKER = 'stryker-test-id:';
