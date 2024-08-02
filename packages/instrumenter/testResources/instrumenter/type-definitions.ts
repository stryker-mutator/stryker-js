/**
 * @see https://github.com/stryker-mutator/stryker-js/issues/2465
 */ 
const flatten = require('lodash/flatten') as typeof import('lodash/flatten');

/**
 * @see https://github.com/babel/babel/issues/16676
 */
(a as any) = (b as any);
