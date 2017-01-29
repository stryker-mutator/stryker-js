import * as _ from 'lodash';

// Don't use JSON.parse, as it does not allow for regexes or functions, etc
export const serialize: (obj: any) => string = require('serialize-javascript');

export function freezeRecursively(target: { [customConfig: string]: any }) {
  Object.freeze(target);
  Object.keys(target).forEach(key => {
    if (_.isObject(target[key])) {
      freezeRecursively(target[key]);
    }
  });
}

export function isPromise(input: void | Promise<any>): input is Promise<any> {
  if (input) {
    return input && typeof (<any>input)['then'] === 'function';
  }
  return false;
}

export function deserialize(serializedJavascript: String): any {
  // Don't use JSON.parse, as it does not allow for regexes or functions, etc
  // tslint:disable
  return eval(`(${serializedJavascript})`);
  // tslint:enable
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