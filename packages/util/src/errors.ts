export function isErrnoException(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && typeof (error as NodeJS.ErrnoException).code === 'string';
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function errorToString(error: any): string {
  if (!error) {
    return '';
  }
  if (error instanceof Error) {
    if (isErrnoException(error)) {
      return `${error.name}: ${error.code} (${error.syscall}) ${error.stack}`;
    }
    const message = `${error.name}: ${error.message}`;
    if (error.stack) {
      return `${message}\n${error.stack.toString()}`;
    } else {
      return message;
    }
  }
  return error.toString();
}

export const ERROR_CODES = Object.freeze({
  NoSuchFileOrDirectory: 'ENOENT',
});
