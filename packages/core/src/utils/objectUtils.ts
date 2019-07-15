import * as _ from 'lodash';
import treeKill = require('tree-kill');
export { serialize, deserialize } from 'surrial';

export function freezeRecursively<T extends { [prop: string]: any }>(
  target: T
): T {
  Object.freeze(target);
  Object.keys(target).forEach(key => {
    if (_.isObject(target[key])) {
      freezeRecursively(target[key]);
    }
  });
  return target;
}

export function filterEmpty<T>(input: (T | null | void)[]) {
  return input.filter(item => item !== undefined && item !== null) as T[];
}

export function copy<T>(obj: T, deep?: boolean) {
  if (deep) {
    return _.cloneDeep(obj);
  } else {
    return _.clone(obj);
  }
}

export function wrapInClosure(codeFragment: string) {
  return `
    (function (window) {
      ${codeFragment}
    })((Function('return this'))());`;
}

/**
 * A wrapper around `process.env` (for testability)
 */
export function getEnvironmentVariable(
  nameEnvironmentVariable: string
): string | undefined {
  return process.env[nameEnvironmentVariable];
}

/**
 * A wrapper around `process.exitCode = n` (for testability)
 */
export function setExitCode(n: number) {
  process.exitCode = n;
}

export function base64Decode(base64EncodedString: string) {
  return Buffer.from(base64EncodedString, 'base64').toString('utf8');
}

export function kill(pid: number): Promise<void> {
  return new Promise((res, rej) => {
    treeKill(pid, 'SIGKILL', (err?: { code?: number } & Error) => {
      if (err && !canIgnore(err.code)) {
        rej(err);
      } else {
        res();
      }
    });

    function canIgnore(code: number | undefined) {
      // https://docs.microsoft.com/en-us/windows/desktop/Debug/system-error-codes--0-499-
      // these error codes mean the program is _already_ closed.
      return code === 255 || code === 128;
    }
  });
}

export const TIMEOUT_EXPIRED: unique symbol = Symbol('TimeoutExpired');
export function timeout<T>(
  promise: Promise<T>,
  ms: number
): Promise<T | typeof TIMEOUT_EXPIRED> {
  const sleep = new Promise<T | typeof TIMEOUT_EXPIRED>((res, rej) => {
    const timer = setTimeout(() => res(TIMEOUT_EXPIRED), ms);
    promise
      .then(result => {
        clearTimeout(timer);
        res(result);
      })
      .catch(error => {
        clearTimeout(timer);
        rej(error);
      });
  });
  return sleep;
}

export function padLeft(input: string): string {
  return input
    .split('\n')
    .map(str => '\t' + str)
    .join('\n');
}
