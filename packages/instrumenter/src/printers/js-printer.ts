import generator from '@babel/generator';

import { JSAst } from '../syntax/index.js';

import { Printer } from './index.js';

const generate = generator.default;

export const print: Printer<JSAst> = (file) => {
  return generate(file.root, { sourceMaps: false }).code;
};
