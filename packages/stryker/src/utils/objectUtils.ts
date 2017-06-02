import * as _ from 'lodash';

// Don't use JSON.parse, as it does not allow for regexes or functions, etc
export const serialize: (obj: any) => string = require('serialize-javascript');

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

export function deserialize(serializedJavascript: String): any {
  // Don't use JSON.parse, as it does not allow for regexes or functions, etc
  // tslint:disable
  return eval(`(${serializedJavascript})`);
  // tslint:enable
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