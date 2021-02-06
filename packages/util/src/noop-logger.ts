export const noopLogger = {
  isTraceEnabled(): boolean {
    return false;
  },
  isDebugEnabled(): boolean {
    return false;
  },
  isInfoEnabled(): boolean {
    return false;
  },
  isWarnEnabled(): boolean {
    return false;
  },
  isErrorEnabled(): boolean {
    return false;
  },
  isFatalEnabled(): boolean {
    return false;
  },
  trace(): void {
    // noop
  },
  debug(): void {
    // noop
  },
  info(): void {
    // noop
  },
  warn(): void {
    // noop
  },
  error(): void {
    // noop
  },
  fatal(): void {
    // noop
  },
};
