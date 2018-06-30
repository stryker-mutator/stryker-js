import * as _ from 'lodash';
import treeKill = require('tree-kill');
export { serialize, deserialize } from 'surrial';

export function freezeRecursively<T extends { [prop: string]: any }>(target: T): T {
  Object.freeze(target);
  Object.keys(target).forEach(key => {
    if (_.isObject(target[key])) {
      freezeRecursively(target[key]);
    }
  });
  return target;
}

export function isPromise(input: any): input is Promise<any> {
  return input && typeof input['then'] === 'function';
}

export function filterEmpty<T>(input: (T | null | void)[]) {
  return input.filter(item => item !== undefined && item !== null) as T[];
}

export function isErrnoException(error: Error): error is NodeJS.ErrnoException {
  return typeof (error as NodeJS.ErrnoException).code === 'string';
}

export function errorToString(error: any) {
  if (!error) {
    return '';
  }
  else if (isErrnoException(error)) {
    return `${error.name}: ${error.code} (${error.syscall}) ${error.stack}`;
  }
  else if (error instanceof Error) {
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
export function getEnvironmentVariable(nameEnvironmentVariable: string): string | undefined {
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

/**
 * Consolidates multiple consecutive white spaces into a single space.
 * @param str The string to be normalized
 */
export function normalizeWhiteSpaces(str: string) {
  return str.replace(/\s+/g, ' ').trim();
}

export function kill(pid: number): Promise<void> {
  return new Promise((res, rej) => {
    treeKill(pid, 'SIGKILL', err => {
      if (err) {
        rej(err);
      } else {
        res();
      }
    });
  });
}