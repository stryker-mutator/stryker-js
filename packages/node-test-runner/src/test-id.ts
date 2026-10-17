const SEPARATOR = String.fromCharCode(0);

export function toTestId(relativeFile: string, name: string): string {
  return `${relativeFile}${SEPARATOR}${name}`;
}

export function fileOfTestId(id: string): string {
  const index = id.indexOf(SEPARATOR);
  return index === -1 ? id : id.slice(0, index);
}

// Prefix of the diagnostic the setup hook emits to carry the file being run.
export const FILE_MARKER = 'stryker-file:';
