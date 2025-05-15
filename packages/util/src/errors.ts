export function isErrnoException(
  error: unknown,
): error is NodeJS.ErrnoException {
  return (
    error instanceof Error &&
    typeof (error as NodeJS.ErrnoException).code === 'string'
  );
}

export function errorToString(error: unknown): string {
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
  // eslint-disable-next-line @typescript-eslint/no-base-to-string -- Ignore as error is most likely a string. Don't use JSON.stringify as circular graphs could cause an error
  return String(error);
}

export const ERROR_CODES = Object.freeze({
  NoSuchFileOrDirectory: 'ENOENT',
});
