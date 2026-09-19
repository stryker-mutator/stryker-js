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
  try {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string -- Ignore as error is most likely a string. Don't use JSON.stringify as circular graphs could cause an error
    return String(error);
  } catch {
    // `String` throws a TypeError for a value that cannot be coerced to a primitive. An object with a
    // null prototype is the common case: it has no `toString`, and it is exactly what a
    // structured-clone-style serializer produces for an error that crossed a worker boundary. Throwing
    // here would replace the error being reported with a TypeError about reporting it, losing the only
    // diagnostic the caller had.
    const { name, message, stack } = error as Record<string, unknown>;
    if (typeof message !== 'string') {
      return Object.prototype.toString.call(error);
    }
    const header = typeof name === 'string' ? `${name}: ${message}` : message;
    return typeof stack === 'string' ? `${header}\n${stack}` : header;
  }
}

export const ERROR_CODES = Object.freeze({
  NoSuchFileOrDirectory: 'ENOENT',
});
