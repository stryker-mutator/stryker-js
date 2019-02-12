/**
 * This wrapper is needed because babel/core only exports
 * non-stubbable es6 properties. See node_modules/@babel/core/lib/index.js
 */
export * from '@babel/core';
