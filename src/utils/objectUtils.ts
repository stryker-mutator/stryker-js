import * as _ from 'lodash';

// Don't use JSON.parse, as it does not allow for regexes or functions, etc
export var serialize: (obj: any) => string = require('serialize-javascript');

export function freezeRecursively(target: { [customConfig: string]: any }) {
  Object.freeze(target);
  Object.keys(target).forEach(key => {
    if (_.isObject(target[key])) {
      freezeRecursively(target[key]);
    }
  });
}

export function isPromise(input: void | Promise<any>): input is Promise<any> {
  return input && typeof (<any>input)['then'] === 'function';
}

export function deserialize(serializedJavascript: String): any {
  // Don't use JSON.parse, as it does not allow for regexes or functions, etc
  return eval(`(${serializedJavascript})`);
}
