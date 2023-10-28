import { isInstanceOf, getParamList, isSurrializable } from './helpers.js';
import ClassConstructor from './class-constructor.js';
import { EOL } from 'os';
export * from './surrializable.js';

const UID = Math.floor(Math.random() * 0x10000000000).toString(16);
const PLACE_HOLDER_REGEXP = new RegExp('"@__' + UID + '-(\\d+)__@"', 'g');
const IS_NATIVE_CODE_REGEXP = /\{\s*\[native code\]\s*\}/g;
const BUILD_IN_SUPPORTED_CLASSES: ReadonlyArray<ClassConstructor> = Object.freeze([Map, Array, Buffer, Set, Date, RegExp]);

/**
 * A surrial template tag, useful for building templates strings while enforcing the values to be serialized using surrial.
 * @param templateLiterals The template literals
 * @param values The values to be serialized using surrial
 */
export function surrial(templateLiterals: TemplateStringsArray, ...values: unknown[]) {
  const stringBuilder: string[] = [];
  for (let i = 0; i < values.length; i++) {
    stringBuilder.push(templateLiterals[i]);
    stringBuilder.push(serialize(values[i]));
  }
  stringBuilder.push(templateLiterals[templateLiterals.length - 1]);
  return stringBuilder.join('');
}

/**
 * Deserializes a string into it's javascript equivalent. CAUTION! Evaluates the string in the current javascript engine
 * (`eval` or one of its friends). Be sure the `serializedThing` comes from a trusted source!
 * @param serializedThing The string to deserialize
 * @param knownClasses A list of known classes used to provide as constructor functions
 */
export function deserialize<T = any>(serializedThing: string, knownClasses: ClassConstructor[] = []): T {
  const evalFn = new Function(...knownClasses.map(t => t.name), `"use strict";${EOL}return (${serializedThing});`);
  return evalFn.call(null, ...knownClasses);
}

/**
 * Serializes the thing to a javascript string. This is NOT necessarily a JSON string, but will be valid javascript.
 * @param thing The thing to be serialized
 * @param knownClasses the classes of which instances are serialized as constructor calls (for example "new Person('Henry')").
 */
export function serialize(thing: any, knownClasses: ReadonlyArray<ClassConstructor> = []): string {
  if (thing instanceof Date) {
    return serializeDate(thing);
  } else if (thing instanceof RegExp) {
    return thing.toString();
  } else if (typeof thing === 'function') {
    return serializeFunction(thing);
  } else if (thing instanceof Buffer) {
    return serializeBuffer(thing);
  } else if (thing instanceof Set) {
    return serializeSet(thing, knownClasses);
  } else if (thing instanceof Map) {
    return serializeMap(thing, knownClasses);
  } else if (Array.isArray(thing)) {
    return serializeArray(thing, knownClasses);
  } else if (isSurrializable(thing)) {
    return thing.surrialize();
  } else if (isInstanceOf(thing, knownClasses)) {
    return serializeClassInstance(thing, knownClasses);
  } else {
    return stringifyObject(thing, knownClasses);
  }
}

function serializeArray(thing: any[], knownClasses: ReadonlyArray<ClassConstructor>) {
  return stringifyObject(thing, knownClasses);
}

function stringifyObject(thing: any, knownClasses: ReadonlyArray<ClassConstructor>): string {
  const escapedValues: any[] = [];

  // Returns placeholders anything JSON doesn't support (identified by index)
  // which are later replaced by their string representation.
  function replacer<T>(this: T, key: keyof T, value: any): any {
    // If the value is an object w/ a toJSON method, toJSON is called before
    // the replacer runs, so we use this[key] to get the non-JSON'd value.
    const origValue = this[key];
    if (
      origValue !== thing &&
      (isInstanceOf(origValue, BUILD_IN_SUPPORTED_CLASSES) || isInstanceOf(origValue, knownClasses) || isSurrializable(origValue))
    ) {
      return `@__${UID}-${escapedValues.push(origValue) - 1}__@`;
    } else {
      return value;
    }
  }

  const str = JSON.stringify(thing, replacer as any);

  // Protects against `JSON.stringify()` returning `undefined`, by serializing
  // to the literal string: "undefined".
  if (typeof str !== 'string') {
    return String(str);
  }

  if (escapedValues.length === 0) {
    return str;
  } else {
    // Replaces all occurrences of placeholders in the
    // JSON string with their string representations. If the original value can
    // not be found, then `undefined` is used.
    PLACE_HOLDER_REGEXP.lastIndex = 0;
    return str.replace(PLACE_HOLDER_REGEXP, (_, valueIndex) => serialize(escapedValues[valueIndex], knownClasses));
  }
}

function serializeSet(value: Set<any>, knownClasses: ReadonlyArray<ClassConstructor>) {
  const valuesArray: string[] = [];
  value.forEach(v => valuesArray.push(serialize(v, knownClasses)));
  return `new Set([${valuesArray.join(', ')}])`;
}

function serializeMap(map: Map<any, any>, knownClasses: ReadonlyArray<ClassConstructor>): string {
  const valuesArray: string[] = [];
  map.forEach((value, key) => valuesArray.push(`[${serialize(key, knownClasses)}, ${serialize(value, knownClasses)}]`));
  return `new Map([${valuesArray.join(', ')}])`;
}

function serializeDate(value: Date) {
  return `new Date("${value.toISOString()}")`;
}

function serializeBuffer(value: Buffer) {
  return `Buffer.from(${serialize(value.toString('binary'))}, "binary")`;
}

function serializeClassInstance(instance: any, knownClasses: ReadonlyArray<ClassConstructor>): string {
  const constructor: ClassConstructor = instance.constructor;
  if (constructor.name.length) {
    const params = getParamList(constructor);
    const paramValues = params.map(param => serialize(instance[param], knownClasses));
    const newExpression = `new ${constructor.name}(${paramValues.join(', ')})`;
    return newExpression;
  } else {
    throw new Error(`Cannot serialize instances of nameless classes (class was defined as: ${constructor.toString()})`);
  }
}

function serializeFunction(fn: Function) {
  const serializedFn = fn.toString();

  IS_NATIVE_CODE_REGEXP.lastIndex = 0;
  if (IS_NATIVE_CODE_REGEXP.test(serializedFn)) {
    throw new TypeError(`Cannot serialize native function: ${fn.name}`);
  }

  return serializedFn;
}
