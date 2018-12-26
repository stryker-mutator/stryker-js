export default function consoleLoggerFactory(category: string) {
  return {
    debug: console.log.bind(console, category, 'DEBUG'),
    error: console.log.bind(console, category, 'ERROR'),
    fatal: console.log.bind(console, category, 'FATAL'),
    info: console.log.bind(console, category, 'INFO'),
    isDebugEnabled: () => true,
    isErrorEnabled: () => true,
    isFatalEnabled: () => true,
    isInfoEnabled: () => true,
    isTraceEnabled: () => true,
    isWarnEnabled: () => true,
    trace: console.log.bind(console, category, 'TRACE'),
    warn: console.log.bind(console, category, 'WARNING')
  };
}
