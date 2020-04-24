export const noopLogger = {
  isTraceEnabled() {
    return false;
  },
  isDebugEnabled() {
    return false;
  },
  isInfoEnabled() {
    return false;
  },
  isWarnEnabled() {
    return false;
  },
  isErrorEnabled() {
    return false;
  },
  isFatalEnabled() {
    return false;
  },
  trace() {
    // noop
  },
  debug() {
    // noop
  },
  info() {
    // noop
  },
  warn() {
    // noop
  },
  error() {
    // noop
  },
  fatal() {
    // noop
  },
};
