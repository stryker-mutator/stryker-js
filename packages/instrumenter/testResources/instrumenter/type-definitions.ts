/**
 * @see https://github.com/stryker-mutator/stryker-js/issues/2465
 */ 
const flatten = require('lodash/flatten') as typeof import('lodash/flatten');

fields.forEach((field) => ((value[field] as any) = (entity as any)[field]._));
