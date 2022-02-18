import generator from '@babel/generator';

import { JSAst } from '../syntax/index.js';

import { Printer } from './index.js';

// @ts-expect-error CJS typings not in line with synthetic esm
const generate: typeof generator = generator.default;

export const print: Printer<JSAst> = (file) => {
  return generate(file.root, { sourceMaps: false }).code;
};
