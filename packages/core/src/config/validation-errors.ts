import { ErrorObject } from 'ajv';

import groupby from 'lodash.groupby';

/**
 * Convert AJV errors to human readable messages
 * @param allErrors The AJV errors to describe
 */
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
function filterRelevantErrors(allErrors: ErrorObject[]): ErrorObject[] {
  // These are the "meta schema" keywords. A Meta schema is a schema consisting of other schemas. See https://json-schema.org/understanding-json-schema/structuring.html
  const META_SCHEMA_KEYWORDS = Object.freeze(['anyOf', 'allOf', 'oneOf']);

  // Split the meta errors from what I call "single errors" (the real errors)
  const [metaErrors, singleErrors] = split(allErrors, (error) =>
    META_SCHEMA_KEYWORDS.includes(error.keyword),
  );

  // Filter out the single errors we want to show
  const nonShadowedSingleErrors = removeShadowingErrors(
    singleErrors,
    metaErrors,
  );

  // We're handling type errors differently, split them out
  const [typeErrors, nonTypeErrors] = split(
    nonShadowedSingleErrors,
    (error) => error.keyword === 'type',
  );

  // Filter out the type errors that already have other errors as well.
  // For example when setting `logLevel: 4`, we don't want to see the error specifying that logLevel should be a string,
  // if the other error already specified that it should be one of the enum values.
  const nonShadowingTypeErrors = typeErrors.filter(
    (typeError) =>
      !nonTypeErrors.some(
        (nonTypeError) => nonTypeError.instancePath === typeError.instancePath,
      ),
  );
  const typeErrorsMerged = mergeTypeErrorsByPath(nonShadowingTypeErrors);
  return [...nonTypeErrors, ...typeErrorsMerged];
}

/**
 * Remove the single errors that are pointing to the same data path.
 * This can happen when using meta schemas.
 * For example, the "mutator" Stryker option can be either a `string` or a `MutatorDescriptor`.
 * A data object of `{ "foo": "bar" }` would result in 2 errors. One of a missing property "name" missing, and one that mutator itself should be a string.
 * @param singleErrors The 'real' errors
 * @param metaErrors The grouping errors
 */
function removeShadowingErrors(
  singleErrors: ErrorObject[],
  metaErrors: ErrorObject[],
): ErrorObject[] {
  return singleErrors.filter((error) => {
    if (
      metaErrors.some((metaError) =>
        error.instancePath.startsWith(metaError.instancePath),
      )
    ) {
      return !singleErrors.some(
        (otherError) =>
          otherError.instancePath.startsWith(error.instancePath) &&
          otherError.instancePath.length > error.instancePath.length,
      );
    } else {
      return true;
    }
  });
}

function split<T>(items: T[], splitFn: (item: T) => boolean): [T[], T[]] {
  return [items.filter(splitFn), items.filter((error) => !splitFn(error))];
}

/**
 * Merge type errors that have the same path into 1.
 * @example
 *  The 'plugins' Stryker option can have 2 types, null or an array of strings.
 *  When setting  `plugins: 'my-plugin'` we get 2 type errors, because it isn't an array AND it isn't `null`.
 * @param typeErrors The type errors to merge by path
 */
function mergeTypeErrorsByPath(typeErrors: ErrorObject[]): ErrorObject[] {
  const typeErrorsByPath = groupby(typeErrors, (error) => error.instancePath);
  return Object.values(typeErrorsByPath).map(mergeTypeErrors);

  function mergeTypeErrors(errors: ErrorObject[]): ErrorObject {
    const params = {
      type: errors.map((error) => error.params.type).join(','),
    };
    return {
      ...errors[0],
      params,
    };
  }
}

/**
 * Converts the AJV error object to a human readable error.
 * @param error The error to describe
 */
function describeError(error: ErrorObject): string {
  const errorPrefix = `Config option "${error.instancePath.substr(1)}"`;

  switch (error.keyword) {
    case 'type': {
      const expectedTypeDescription = error.params.type.split(',').join(' or ');
      return `${errorPrefix} has the wrong type. It should be a ${expectedTypeDescription}, but was a ${jsonSchemaType(error.data)}.`;
    }
    case 'enum':
      return `${errorPrefix} should be one of the allowed values (${error.params.allowedValues.map(stringify).join(', ')}), but was ${stringify(
        error.data,
      )}.`;
    case 'minimum':
    case 'maximum':
      return `${errorPrefix} ${error.message}, was ${String(error.data)}.`;
    default:
      return `${errorPrefix} ${error.message!.replace(/'/g, '"')}`;
  }
}

/**
 * Returns the JSON schema name of the type. JSON schema types are slightly different from actual JS types.
 * @see https://json-schema.org/understanding-json-schema/reference/type.html
 * @param value The value of which it's type should be known
 */
function jsonSchemaType(value: unknown): string {
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
