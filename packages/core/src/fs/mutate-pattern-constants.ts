export const IGNORE_PATTERN_CHARACTER = '!';

/**
 * @see https://stryker-mutator.io/docs/stryker-js/configuration/#mutate-string
 * @example
 * * "src/app.js:1-11" will mutate lines 1 through 11 inside app.js.
 * * "src/app.js:5:4-6:4" will mutate from line 5, column 4 through line 6 column 4 inside app.js (columns 4 are included).
 * * "src/app.js:5-6:4" will mutate from line 5, column 0 through line 6 column 4 inside app.js (column 4 is included).
 */
export const MUTATION_RANGE_REGEX =
  /(.*?):((\d+)(?::(\d+))?-(\d+)(?::(\d+))?)$/;
