/**
 * @see https://github.com/tc39/proposal-object-values-entries/blob/master/polyfill.js
 */
const reduce = Function.bind.call(Function.call as any, Array.prototype.reduce);
const isEnumerable = Function.bind.call(Function.call as any, Object.prototype.propertyIsEnumerable);
const concat = Function.bind.call(Function.call as any, Array.prototype.concat);
const keys = Reflect.ownKeys;

if (!Object.values) {
  Object.values = function values(O: object) {
    return reduce(keys(O), (v: any, k: any) => concat(v, typeof k === 'string' && isEnumerable(O, k) ? [(O as any)[k]] : []), []);
  } as any;
}

if (!Object.entries) {
  Object.entries = function entries(O: object) {
    return reduce(keys(O), (e: any, k: any) => concat(e, typeof k === 'string' && isEnumerable(O, k) ? [[k, (O as any)[k]]] : []), []);
  } as any;
}
