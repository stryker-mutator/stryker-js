import { ErrorObject, TypeParams, EnumParams } from 'ajv';

import groupby = require('lodash.groupby');

export function describeErrors(allErrors: ErrorObject[]): string[] {
  const processedErrors = filterRelevantErrors(allErrors);
  return processedErrors.map(describeError);
}

/**
 * Filters the relevant AJV errors for error reporting.
 * Removes meta schema errors, merges type errors for the same `dataPath` and removes type errors for which another error also exist.
 * @param allErrors The raw source AJV errors
 * @example
 * This:
 *  ```
 *  [
 *   {
 *     keyword: 'type',
 *     dataPath: '.mutator',
 *     params: { type: 'string' },
 *     [...]
 *   },
 *   {
 *     keyword: 'required',
 *     dataPath: '.mutator',
 *     params: { missingProperty: 'name' },
 *     [...]
 *   },
 *   {
 *     keyword: 'oneOf',
 *     dataPath: '.mutator',
 *     params: { passingSchemas: null },
 *     [...]
 *   }
 *  ]
 *  ```
 *
 * Becomes:
 *  ```
 *  [
 *   {
 *    keyword: 'required',
 *    dataPath: '.mutator',
 *    params: { missingProperty: 'name' },
 *    [...]
 *   }
 *  ]
 *  ```
 */
function filterRelevantErrors(allErrors: ErrorObject[]) {
  const META_SCHEMA_KEYWORDS = Object.freeze(['anyOf', 'allOf', 'oneOf']);
  const [metaErrors, singleErrors] = split(allErrors, error => META_SCHEMA_KEYWORDS.includes(error.keyword));
  const nonShadowedSingleErrors = removeShadowingErrors(singleErrors, metaErrors);
  const [typeErrors, nonTypeErrors] = split(nonShadowedSingleErrors, error => error.keyword === 'type');
  const nonShadowingTypeErrors = typeErrors.filter(typeError => !nonTypeErrors.some(nonTypeError => nonTypeError.dataPath === typeError.dataPath));
  const typeErrorsByPath = groupby(nonShadowingTypeErrors, error => error.dataPath);
  const typeErrorsFiltered = Object.values(typeErrorsByPath).map(mergeTypeErrors);
  return [...nonTypeErrors, ...typeErrorsFiltered];
}

function removeShadowingErrors(singleErrors: ErrorObject[], metaErrors: ErrorObject[]) {
  return singleErrors.filter(error => {
    if (metaErrors.some(metaError => error.dataPath.startsWith(metaError.dataPath))) {
      return !singleErrors.some(otherError => otherError.dataPath.startsWith(error.dataPath) && otherError.dataPath.length > error.dataPath.length);
    } else {
      return true;
    }
  });
}

function split<T>(items: T[], splitFn: (item: T) => boolean) {
  return [items.filter(splitFn), items.filter(error => !splitFn(error))];
}

function mergeTypeErrors(typeErrors: ErrorObject[]): ErrorObject {
  const params: TypeParams = {
    type: typeErrors.map(error => (error.params as TypeParams).type).join(',')
  };
  return {
    ...typeErrors[0],
    params
  };
}

function describeError(error: ErrorObject) {
  const errorPrefix = `Config option "${error.dataPath.substr(1)}"`;

  switch (error.keyword) {
    case 'type':
      const expectedTypeDescription = (error.params as TypeParams).type.split(',').join(' or ');
      return `${errorPrefix} has the wrong type. It should be a ${expectedTypeDescription}, but was a ${jsonSchemaType(error.data)}.`;
    case 'enum':
      return `${errorPrefix} should be one of the allowed values (${(error.params as EnumParams).allowedValues
        .map(stringify)
        .join(', ')}), but was ${stringify(error.data)}.`;
    case 'minimum':
    case 'maximum':
      return `${errorPrefix} ${error.message}, was ${error.data}.`;
    default:
      return `${errorPrefix} ${error.message!.replace(/'/g, '"')}`;
  }
}
function jsonSchemaType(value: unknown) {
  if (value === null) {
    return 'null';
  }
  if (value === undefined) {
    return 'undefined';
  }
  if (Array.isArray(value)) {
    return 'array';
  }
  return typeof value;
}

function stringify(value: unknown): string {
  if (typeof value === 'number' && isNaN(value)) {
    return 'NaN';
  } else {
    return JSON.stringify(value);
  }
}
