/**
 * This wrapper is needed because babel/core only exports
 * non-stubbable es6 properties. See node_modules/@babel/core/lib/index.js
 */
import * as babel from '@babel/core';

export type { BabelFileResult, TransformOptions, ConfigFunction, ConfigAPI } from '@babel/core';

export const transformSync = babel.transformSync;
export const DEFAULT_EXTENSIONS = babel.DEFAULT_EXTENSIONS;
