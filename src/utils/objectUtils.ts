import * as _ from 'lodash';

export function freezeRecursively(target: {[customConfig: string]: any}){
  Object.freeze(target);
  Object.keys(target).forEach(key => {
    if(_.isObject(target[key])){
      freezeRecursively(target[key]);
    }
  });
}