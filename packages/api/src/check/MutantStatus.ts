export enum MutantStatus {
  Init = 'init',
  Ignored = 'ignored',
  NoCoverage = 'noCoverage',
  Killed = 'killed',
  Survived = 'survived',
  TimedOut = 'timedOut',
  RuntimeError = 'runtimeError',
  CompileError = 'compileError',
}
