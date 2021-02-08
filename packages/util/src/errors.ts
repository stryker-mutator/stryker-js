export function isErrnoException(error: Error): error is NodeJS.ErrnoException {
  return typeof (error as NodeJS.ErrnoException).code === 'string';
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function errorToString(error: any): string {
  if (!error) {
    return '';
  } else if (isErrnoException(error)) {
    return `${error.name}: ${error.code} (${error.syscall}) ${error.stack}`;
  } else if (error instanceof Error) {
    const message = `${error.name}: ${error.message}`;
    if (error.stack) {
      return `${message}\n${error.stack.toString()}`;
    } else {
      return message;
    }
  } else {
    return error.toString();
  }
}
